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

async def migrate_ingestion_v4():
    print("🚀 Iteration 4: Migrating Ingestion Module (Threads & Emails)...")
    async with engine.begin() as conn:
        try:
            # 1. Update threads table
            print("Updating threads table...")
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS connected_account_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;"))
            
            # Remove old is_unread if exists, or keep? Better to handle in logic or drop safe. 
            # We'll just add new columns.
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;"))
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS priority_level VARCHAR;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS content_hash VARCHAR;"))
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS intel_status VARCHAR DEFAULT 'pending';"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS intel_error VARCHAR;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS intel_attempts INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS intel_completed_at TIMESTAMP;"))
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS summary_model VARCHAR;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS summary_tokens_used INTEGER;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS summary_cost_cents INTEGER;"))
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '[]';"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS entities_extracted JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS sentiment VARCHAR;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS first_email_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_threads_user_updated ON threads(user_id, last_email_at DESC) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_threads_intel_pending ON threads(id) WHERE intel_status = 'pending';"))
            
            
            # 2. Update emails table
            print("Updating emails table...")
            # Note: We are migrating `emails` table. If `messages` table existed from previous `thread.py`, we might need to migrate data or rename it.
            # Assuming we are using `emails` table as provided in `email.py`.
            
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS sender VARCHAR;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS sender_name VARCHAR;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS recipients JSONB;")) # Required in new model but add as nullable first if data exists
            
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_reply BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_forward BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS in_reply_to VARCHAR;"))
            await conn.execute(text('ALTER TABLE emails ADD COLUMN IF NOT EXISTS "references" TEXT[];'))
            
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS attachment_count INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS total_attachment_size_bytes BIGINT DEFAULT 0;"))
            
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS headers JSONB;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Rename columns if needed (e.g. from_address -> sender) or COPY data.
            # For this iteration, we assume we might need to support both or just add new ones.
            # If `from_address` exists, copying to `sender` is good practice if not null.
            try:
                await conn.execute(text("UPDATE emails SET sender = from_address WHERE sender IS NULL AND from_address IS NOT NULL;"))
            except Exception:
                pass 
                
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id, received_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_emails_user_received ON emails(user_id, received_at DESC) WHERE deleted_at IS NULL;"))

            print("✅ Iteration 4 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_ingestion_v4())
