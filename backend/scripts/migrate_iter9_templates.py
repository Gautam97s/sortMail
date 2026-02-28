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

async def migrate_templates_v9():
    print("🚀 Iteration 9: Migrating Email Templates...")
    async with engine.begin() as conn:
        try:
            # 1. Create/Update email_templates table
            print("Creating email_templates table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS email_templates (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    workspace_id VARCHAR REFERENCES workspaces(id),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    subject VARCHAR(500),
                    body TEXT NOT NULL,
                    variables JSONB DEFAULT '[]',
                    category VARCHAR(100),
                    is_public BOOLEAN DEFAULT FALSE,
                    usage_count INTEGER DEFAULT 0,
                    last_used_at TIMESTAMP,
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Add columns if reusing existing
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS workspace_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]';"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100);"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))

            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_templates_user ON email_templates(user_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_templates_workspace ON email_templates(workspace_id) WHERE is_public = true AND deleted_at IS NULL;"))

            print("✅ Iteration 9 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_templates_v9())
