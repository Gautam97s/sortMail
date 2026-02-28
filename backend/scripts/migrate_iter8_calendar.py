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

async def migrate_calendar_drafts_v8():
    print("🚀 Iteration 8: Migrating Calendar & Drafts...")
    async with engine.begin() as conn:
        try:
            # 1. Update calendar_suggestions table
            print("Updating calendar_suggestions table...")
            # If exists, update schema
            # Allow creation if not exists
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS calendar_suggestions (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    thread_id VARCHAR NOT NULL REFERENCES threads(id),
                    email_id VARCHAR NOT NULL REFERENCES emails(id),
                    event_type VARCHAR DEFAULT 'meeting',
                    title VARCHAR NOT NULL,
                    description TEXT,
                    suggested_date DATE,
                    suggested_time TIMESTAMP,
                    suggested_end_time TIMESTAMP,
                    suggested_timezone VARCHAR,
                    location VARCHAR,
                    participants TEXT[] DEFAULT '{}',
                    is_recurring BOOLEAN DEFAULT FALSE,
                    recurrence_pattern VARCHAR,
                    confidence_score INTEGER NOT NULL,
                    status VARCHAR DEFAULT 'suggested',
                    accepted_at TIMESTAMP,
                    dismissed_at TIMESTAMP,
                    external_calendar_event_id VARCHAR,
                    metadata_json JSONB DEFAULT '{}',
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Add columns if reusing existing table (schema had created_at but minimal)
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS email_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS event_type VARCHAR DEFAULT 'meeting';"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS description TEXT;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS suggested_date DATE;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS suggested_end_time TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS suggested_timezone VARCHAR;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS location VARCHAR;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS participants TEXT[] DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'suggested';"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS external_calendar_event_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE calendar_suggestions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_calendar_user_status ON calendar_suggestions(user_id, status) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_calendar_thread ON calendar_suggestions(thread_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_suggestions(suggested_date) WHERE status = 'suggested';"))


            # 2. Update drafts table
            print("Updating drafts table...")
            # If exists, update schema
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS drafts (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    thread_id VARCHAR NOT NULL REFERENCES threads(id),
                    reply_to_email_id VARCHAR REFERENCES emails(id),
                    tone VARCHAR,
                    custom_instructions TEXT,
                    subject VARCHAR NOT NULL,
                    body TEXT NOT NULL,
                    generation_model VARCHAR NOT NULL,
                    tokens_used INTEGER,
                    cost_cents INTEGER,
                    status VARCHAR DEFAULT 'generated',
                    user_edited BOOLEAN DEFAULT FALSE,
                    copied_at TIMESTAMP,
                    sent_at TIMESTAMP,
                    feedback VARCHAR,
                    feedback_comment TEXT,
                    metadata_json JSONB DEFAULT '{}',
                    version INTEGER DEFAULT 0,
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS reply_to_email_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS custom_instructions TEXT;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS generation_model VARCHAR;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS tokens_used INTEGER;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS cost_cents INTEGER;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'generated';"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS copied_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS feedback VARCHAR;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS feedback_comment TEXT;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE drafts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_drafts_user_thread ON drafts(user_id, thread_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status, created_at DESC);"))

            print("✅ Iteration 8 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_calendar_drafts_v8())
