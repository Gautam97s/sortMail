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

async def migrate_notifications_v12():
    print("🚀 Iteration 12: Migrating Notifications System...")
    async with engine.begin() as conn:
        try:
            # 1. Create notifications table
            print("Creating notifications table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    type VARCHAR NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    body TEXT,
                    action_url VARCHAR(500),
                    action_text VARCHAR(100),
                    related_entity_type VARCHAR(50),
                    related_entity_id VARCHAR,
                    priority VARCHAR DEFAULT 'normal',
                    is_read BOOLEAN DEFAULT FALSE,
                    read_at TIMESTAMP,
                    is_dismissed BOOLEAN DEFAULT FALSE,
                    dismissed_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = false;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;"))


            # 2. Create notification_preferences table
            print("Creating notification_preferences table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notification_preferences (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
                    email_enabled BOOLEAN DEFAULT TRUE,
                    push_enabled BOOLEAN DEFAULT FALSE,
                    in_app_enabled BOOLEAN DEFAULT TRUE,
                    channels JSONB DEFAULT '{}',
                    quiet_hours_start TIME,
                    quiet_hours_end TIME,
                    quiet_hours_timezone VARCHAR(50),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            print("✅ Iteration 12 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_notifications_v12())
