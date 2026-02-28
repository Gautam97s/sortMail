import asyncio
import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set strict env vars for connection
# URL Encoded password: @ -> %40
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")
# ... other envs ...

from sqlalchemy.ext.asyncio import create_async_engine

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

async def migrate_v2():
    print("🚀 Migrating Credit System (v2) with PgBouncer fix...")
    async with engine.begin() as conn:
        try:
            # 1. Update user_credits
            print("Updating user_credits table...")
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS billing_cycle_start DATE;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS credits_expire_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS previous_plan VARCHAR;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS plan_changed_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS last_operation_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS operations_count_last_minute INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS operations_count_last_hour INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS balance_updated_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;"))
            
            # 2. Update credit_transactions
            print("Updating credit_transactions table...")
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'completed';"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS refunded_transaction_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS source_user_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS ip_address VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS user_agent VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS flag_reason VARCHAR;"))
            
            # 3. Create UserCreditLimits
            print("Creating user_credit_limits table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_credit_limits (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
                    max_credits_per_day INTEGER,
                    max_credits_per_operation INTEGER,
                    allowed_operations JSONB,
                    blocked_operations JSONB,
                    reason VARCHAR,
                    set_by_admin_id VARCHAR REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))

            # 4. Create CreditUsageDaily
            print("Creating credit_usage_daily table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS credit_usage_daily (
                    id VARCHAR PRIMARY KEY,
                    date DATE NOT NULL,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    operation_type VARCHAR NOT NULL,
                    credits_used INTEGER DEFAULT 0,
                    operations_count INTEGER DEFAULT 0,
                    actual_cost_cents INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT uq_daily_usage UNIQUE (date, user_id, operation_type)
                );
            """))
            
            print("✅ Migration v2 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_v2())
