"""
Database Connection
-------------------
SQLAlchemy async database setup.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
import logging

from app.config import settings


from sqlalchemy.engine.url import make_url

import ssl

logger = logging.getLogger("db.schema")

# Database Setup
original_url = settings.DATABASE_URL
if original_url and original_url.startswith("postgres://"):
    original_url = original_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif original_url and original_url.startswith("postgresql://"):
    original_url = original_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Debug Logging (Mask password)
try:
    u = make_url(original_url)
    logger.info("Connecting to DB Host: %s:%s | DB: %s", u.host, u.port, u.database)
except Exception as e:
    logger.warning("Could not parse DB URL for logging: %s", e)

# Use make_url to safely manipulate the URL
db_url_obj = make_url(original_url)

# SSL Context for Production (Railway/Supabase usually need this)
# SSL and Connection Arguments
connect_args = {}

# Check for Production / Railway / Supabase
is_production = (
    settings.ENVIRONMENT == "production" 
    or "railway" in settings.DATABASE_URL 
    or "railway" in (db_url_obj.host or "") 
    or "supabase" in (db_url_obj.host or "")
)

if is_production:
    logger.info("Configuring database for PRODUCTION/CLOUD environment")
    
    # 1. SSL Context (Necessary for Supabase/Railway)
    # We use a custom context to avoid "certificate verify failed" or hostname mismatches
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx
    
    # 2. Check for Transaction Pooler (PgBouncer default port is 6543 on Supabase)
    # If using port 6543, we MUST disable prepared statements.
    # If using port 5432 (Direct), we can keep them enabled for better performance.
    if db_url_obj.port == 6543:
        logger.info("Detected PgBouncer (Port 6543). Disabling prepared statements.")
        connect_args["statement_cache_size"] = 0
    else:
        logger.info("Detected Direct Connection (Port %s). Prepared statements enabled.", db_url_obj.port)

    # 3. Strip 'sslmode' query param to avoid conflicts with our manual SSL context
    query_params = dict(db_url_obj.query)
    if "sslmode" in query_params:
        logger.info("Removing 'sslmode' query parameter (handled manually)")
        del query_params["sslmode"]
    
    # Ensure no conflicting args in query if we set them in connect_args
    if "statement_cache_size" in query_params:
         del query_params["statement_cache_size"]

    db_url_obj = db_url_obj._replace(query=query_params)
    
else:
    logger.info("Configuring database for LOCAL environment")

logger.debug(f"Connection configured with SSL (production)")

# Never echo SQL in production even if DEBUG is accidentally set in env.
sql_echo_enabled = bool(settings.DEBUG) and not is_production

# Create async engine
engine = create_async_engine(
    db_url_obj,
    echo=sql_echo_enabled,
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True if not is_production else False, # Pre-ping might attempt prepared statements
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Alias for code that imports async_session_factory
async_session_factory = async_session

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """Dependency for getting database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Compatibility self-heal:
        # Some deployed environments may lag Alembic and miss newer columns.
        # Add critical columns idempotently so API queries don't crash on startup.
        await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE"))
        await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_trash BOOLEAN DEFAULT FALSE"))

        # Schema audit: warn on drift so missing objects are visible at startup.
        required_columns = [
            ("threads", "is_archived"),
            ("threads", "is_trash"),
            ("tasks", "status"),
            ("tasks", "task_type"),
        ]
        missing_columns = []

        for table_name, column_name in required_columns:
            result = await conn.execute(
                text(
                    """
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = :table_name
                      AND column_name = :column_name
                    LIMIT 1
                    """
                ),
                {"table_name": table_name, "column_name": column_name},
            )
            if result.scalar() is None:
                missing_columns.append(f"{table_name}.{column_name}")

        required_types = ["taskstatus", "tasktype", "tonetype"]
        missing_types = []

        for type_name in required_types:
            type_result = await conn.execute(
                text(
                    """
                    SELECT 1
                    FROM pg_type t
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                      AND t.typname = :type_name
                    LIMIT 1
                    """
                ),
                {"type_name": type_name},
            )
            if type_result.scalar() is None:
                missing_types.append(type_name)

        if missing_columns or missing_types:
            logger.warning(
                "Schema drift detected at startup. missing_columns=%s missing_types=%s",
                missing_columns,
                missing_types,
            )
        else:
            logger.info("Schema audit passed for critical columns and types")
