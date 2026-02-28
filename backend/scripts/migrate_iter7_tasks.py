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

async def migrate_tasks_v7():
    print("🚀 Iteration 7: Migrating Tasks & FollowUps...")
    async with engine.begin() as conn:
        try:
            # 1. Update tasks table
            print("Updating tasks table...")
            # If tasks table exists, alter it. If not, create it.
            # Assuming it exists as per `Task` model, but maybe empty.
            # Let's use CREATE IF NOT EXISTS logic for new table or ALERT for existing.
            # Since we are "Updating", likely it existed.
            # However, previous schema might be very different.
            
            # Allow creating from scratch if doesn't exist
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL,
                    thread_id VARCHAR,
                    workspace_id VARCHAR,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    priority_level VARCHAR,
                    priority_score INTEGER DEFAULT 0,
                    status VARCHAR DEFAULT 'todo',
                    source_type VARCHAR DEFAULT 'user_created',
                    source_email_id VARCHAR,
                    ai_confidence INTEGER,
                    due_date DATE,
                    due_time TIMESTAMP,
                    reminder_at TIMESTAMP,
                    reminder_sent BOOLEAN DEFAULT FALSE,
                    completed_at TIMESTAMP,
                    assigned_to_user_id VARCHAR,
                    tags TEXT[] DEFAULT '{}',
                    metadata_json JSONB DEFAULT '{}',
                    version INTEGER DEFAULT 0,
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # If table existed, we might need to add columns.
            # Handle thread_id -> source_thread_id rename first
            try:
                await conn.execute(text("ALTER TABLE tasks RENAME COLUMN thread_id TO source_thread_id;"))
            except Exception:
                # If rename fails, maybe it doesn't exist or already renamed. ensure source_thread_id exists.
                await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_thread_id VARCHAR;"))

            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_level VARCHAR;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_type VARCHAR DEFAULT 'user_created';"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_email_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_time TIMESTAMP;")) # Using TIMESTAMP for time + date or just time? Model says DateTime.
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to_user_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            
            # Adjust indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due ON tasks(user_id, status, due_date) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_source_thread ON tasks(source_thread_id) WHERE deleted_at IS NULL;"))


            # 2. Create/Update follow_ups table (renaming waiting_for)
            print("Migrating waiting_for -> follow_ups...")
            
            # Rename if exists
            try:
                await conn.execute(text("ALTER TABLE waiting_for RENAME TO follow_ups;"))
            except Exception:
                # Might not exist or already renamed
                pass
                
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS follow_ups (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL,
                    thread_id VARCHAR NOT NULL,
                    email_id VARCHAR,
                    expected_reply_by TIMESTAMP,
                    reminder_at TIMESTAMP,
                    reminder_sent BOOLEAN DEFAULT FALSE,
                    status VARCHAR DEFAULT 'waiting',
                    snoozed_until TIMESTAMP,
                    reply_received_at TIMESTAMP,
                    auto_detected BOOLEAN DEFAULT FALSE,
                    detection_confidence INTEGER,
                    metadata_json JSONB DEFAULT '{}',
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Add columns if reusing table
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS email_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS expected_reply_by TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'waiting';"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS detection_confidence INTEGER;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_followups_user_status ON follow_ups(user_id, status) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_followups_thread ON follow_ups(thread_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_followups_overdue ON follow_ups(expected_reply_by) WHERE status = 'waiting';"))

            print("✅ Iteration 7 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_tasks_v7())
