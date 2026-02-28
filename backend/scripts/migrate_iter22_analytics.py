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

async def migrate_analytics_v22():
    print("🚀 Iteration 22: Migrating Analytics System (Final)...")
    async with engine.begin() as conn:
        try:
            # 1. Create user_activity_logs table
            print("Creating user_activity_logs table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_activity_logs (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    action_type VARCHAR NOT NULL,
                    description TEXT,
                    metadata_json JSONB DEFAULT '{}',
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON user_activity_logs(user_id, created_at DESC);"))


            # 2. Create user_analytics_daily table
            print("Creating user_analytics_daily table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_analytics_daily (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    date DATE NOT NULL,
                    emails_received INTEGER DEFAULT 0,
                    emails_sent INTEGER DEFAULT 0,
                    threads_processed INTEGER DEFAULT 0,
                    time_saved_minutes INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT uq_user_analytics_date UNIQUE (user_id, date)
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics_daily(date);"))


            # 3. Create system_analytics_daily table
            print("Creating system_analytics_daily table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS system_analytics_daily (
                    id VARCHAR PRIMARY KEY,
                    date DATE NOT NULL UNIQUE,
                    total_users INTEGER DEFAULT 0,
                    active_users_daily INTEGER DEFAULT 0,
                    total_emails_processed BIGINT DEFAULT 0,
                    total_api_calls BIGINT DEFAULT 0,
                    revenue_cents BIGINT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            print("✅ Iteration 22 (Analytics) Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_analytics_v22())
