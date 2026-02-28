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

async def migrate_credits_v10():
    print("🚀 Iteration 10: Migrating Credits System...")
    async with engine.begin() as conn:
        try:
            # 1. Update user_credits table
            print("Updating user_credits table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_credits (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
                    credits_balance INTEGER DEFAULT 0 NOT NULL,
                    credits_total_earned BIGINT DEFAULT 0,
                    credits_total_spent BIGINT DEFAULT 0,
                    plan VARCHAR DEFAULT 'free',
                    monthly_credits_allowance INTEGER DEFAULT 50 NOT NULL,
                    credits_used_this_month INTEGER DEFAULT 0,
                    billing_cycle_start DATE NOT NULL,
                    credits_expire_at TIMESTAMP,
                    previous_plan VARCHAR,
                    plan_changed_at TIMESTAMP,
                    last_operation_at TIMESTAMP,
                    operations_count_last_minute INTEGER DEFAULT 0,
                    operations_count_last_hour INTEGER DEFAULT 0,
                    balance_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    version INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            # Alter columns if needed (assuming table exists from previous phase)
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS billing_cycle_start DATE;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS credits_expire_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS previous_plan VARCHAR;"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS balance_updated_at TIMESTAMP DEFAULT NOW();"))
            await conn.execute(text("ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON user_credits(credits_balance) WHERE credits_balance > 0;"))


            # 2. Update credit_transactions table
            print("Updating credit_transactions table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS credit_transactions (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    amount INTEGER NOT NULL,
                    balance_after INTEGER NOT NULL,
                    transaction_type VARCHAR NOT NULL,
                    operation_type VARCHAR(50),
                    related_entity_id VARCHAR,
                    status VARCHAR DEFAULT 'completed',
                    expires_at TIMESTAMP,
                    refunded_transaction_id VARCHAR REFERENCES credit_transactions(id),
                    is_refunded BOOLEAN DEFAULT FALSE,
                    source_user_id VARCHAR REFERENCES users(id),
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    is_flagged BOOLEAN DEFAULT FALSE,
                    flag_reason TEXT,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS operation_type VARCHAR(50);"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS related_entity_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS refunded_transaction_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS flag_reason TEXT;"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_credit_txns_user_created ON credit_transactions(user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_credit_txns_type ON credit_transactions(transaction_type, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_credit_txns_operation ON credit_transactions(operation_type) WHERE operation_type IS NOT NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_credit_txns_flagged ON credit_transactions(user_id) WHERE is_flagged = true;"))


            # 3. Update credit_pricing table
            print("Updating credit_pricing table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS credit_pricing (
                    id VARCHAR PRIMARY KEY,
                    operation_type VARCHAR(100) UNIQUE NOT NULL,
                    credits_cost INTEGER NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    description TEXT,
                    effective_from DATE NOT NULL,
                    effective_until DATE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("ALTER TABLE credit_pricing ADD COLUMN IF NOT EXISTS description TEXT;"))
            await conn.execute(text("ALTER TABLE credit_pricing ADD COLUMN IF NOT EXISTS effective_from DATE;"))
            await conn.execute(text("ALTER TABLE credit_pricing ADD COLUMN IF NOT EXISTS effective_until DATE;"))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_credit_pricing_active ON credit_pricing(operation_type) WHERE is_active = true;"))


            # 4. Create credit_packages table
            print("Creating credit_packages table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS credit_packages (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    credits_amount INTEGER NOT NULL,
                    price_cents INTEGER NOT NULL,
                    bonus_percentage INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    display_order INTEGER DEFAULT 0,
                    valid_from DATE,
                    valid_until DATE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            # If exists, add new cols
            await conn.execute(text("ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS valid_from DATE;"))
            await conn.execute(text("ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS valid_until DATE;"))


            # 5. Create user_credit_limits table
            print("Creating user_credit_limits table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_credit_limits (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR UNIQUE NOT NULL REFERENCES users(id),
                    max_credits_per_day INTEGER,
                    max_credits_per_operation INTEGER,
                    allowed_operations TEXT[],
                    blocked_operations TEXT[],
                    reason TEXT,
                    set_by_admin_id VARCHAR REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            print("✅ Iteration 10 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_credits_v10())
