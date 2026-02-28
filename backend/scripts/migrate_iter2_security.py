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

async def migrate_security_v2():
    print("🚀 Iteration 2: Migrating Security Module...")
    async with engine.begin() as conn:
        try:
            # 1. Create user_security_events table
            print("Creating user_security_events table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_security_events (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR REFERENCES users(id),
                    event_type VARCHAR NOT NULL,
                    ip_address VARCHAR NOT NULL,
                    user_agent VARCHAR NOT NULL,
                    device_fingerprint VARCHAR,
                    metadata_json JSONB DEFAULT '{}',
                    severity VARCHAR DEFAULT 'info',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON user_security_events(user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_security_events_type ON user_security_events(event_type);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_security_events_severity ON user_security_events(severity) WHERE severity IN ('warning', 'critical');"))

            # 2. Create workspaces table
            print("Creating workspaces table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workspaces (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    slug VARCHAR UNIQUE NOT NULL,
                    owner_id VARCHAR NOT NULL REFERENCES users(id),
                    plan VARCHAR DEFAULT 'team',
                    seat_limit INTEGER NOT NULL,
                    seats_used INTEGER DEFAULT 1,
                    settings JSONB DEFAULT '{}',
                    billing_email VARCHAR,
                    status VARCHAR DEFAULT 'active',
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);"))
            
            # 3. Add workspace_id index to users if not exists (Module 1 cleanup)
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id) WHERE deleted_at IS NULL;"))

            print("✅ Iteration 2 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_security_v2())
