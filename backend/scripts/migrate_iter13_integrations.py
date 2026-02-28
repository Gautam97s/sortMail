import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set strict env vars for connection
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")

database_url = os.environ.get("DATABASE_URL").replace("postgresql://", "postgresql+asyncpg://") if "postgresql://" in os.environ.get("DATABASE_URL") else os.environ.get("DATABASE_URL")
engine = create_async_engine(
    database_url,
    echo=True,
    connect_args={"prepared_statement_cache_size": 0, "statement_cache_size": 0}
)

async def migrate_integrations_v13():
    print("🚀 Iteration 13: Migrating Integrations System...")
    async with engine.begin() as conn:
        try:
            # 1. Create integrations table
            print("Creating integrations table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS integrations (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    workspace_id VARCHAR REFERENCES workspaces(id),
                    integration_type VARCHAR NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    status VARCHAR DEFAULT 'active',
                    config JSONB NOT NULL DEFAULT '{}',
                    credentials_encrypted TEXT,
                    last_triggered_at TIMESTAMP,
                    trigger_count BIGINT DEFAULT 0,
                    error_count INTEGER DEFAULT 0,
                    last_error TEXT,
                    last_error_at TIMESTAMP,
                    metadata_json JSONB DEFAULT '{}',
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_integrations_user_type ON integrations(user_id, integration_type) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON integrations(workspace_id) WHERE deleted_at IS NULL;"))


            # 2. Create integration_logs table
            print("Creating integration_logs table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS integration_logs (
                    id VARCHAR PRIMARY KEY,
                    integration_id VARCHAR NOT NULL REFERENCES integrations(id),
                    trigger_type VARCHAR(100) NOT NULL,
                    payload JSONB NOT NULL,
                    response JSONB,
                    status VARCHAR NOT NULL,
                    error_message TEXT,
                    latency_ms INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(integration_id, created_at DESC);"))
            
            print("✅ Iteration 13 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_integrations_v13())
