import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set strict env vars for connection
# URL Encoded password: @ -> %40
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")

# Need to disable prepared statements for PgBouncer transaction pooling
database_url = os.environ.get("DATABASE_URL").replace("postgresql://", "postgresql+asyncpg://") if "postgresql://" in os.environ.get("DATABASE_URL") else os.environ.get("DATABASE_URL")
engine = create_async_engine(
    database_url,
    echo=True,
    connect_args={
        "prepared_statement_cache_size": 0, 
        "statement_cache_size": 0,
    }
)

async def migrate_users_v2():
    print("🚀 Iteration 1: Migrating User Module...")
    async with engine.begin() as conn:
        try:
            # 1. Update users table with new columns
            print("Updating users table...")
            
            # Enums might need to be created if not exist
            # Note: SQLAlchemy CreateTable handles this usually, but for ALTER we might need manual type creation if we were strict.
            # For simplicity in this script, we'll store Enums as VARCHARs if using string check, but SQLAlchemy casts them.
            # Best practice for live migration: use VARCHAR then check constraints, or create TYPE.
            
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR DEFAULT 'individual';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS workspace_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            
            # 2. Create user_sessions table
            print("Creating user_sessions table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    token_hash VARCHAR NOT NULL UNIQUE,
                    device_fingerprint VARCHAR,
                    ip_address VARCHAR NOT NULL,
                    user_agent VARCHAR NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    is_revoked BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            # Index for sessions
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id) WHERE is_revoked = false;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);"))

            print("✅ Iteration 1 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_users_v2())
