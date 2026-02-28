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

async def migrate_billing_v11():
    print("🚀 Iteration 11: Migrating Billing System...")
    async with engine.begin() as conn:
        try:
            # 1. Create subscriptions table
            print("Creating subscriptions table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
                    workspace_id VARCHAR REFERENCES workspaces(id),
                    stripe_customer_id VARCHAR(255) NOT NULL,
                    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
                    stripe_price_id VARCHAR(255) NOT NULL,
                    plan VARCHAR NOT NULL,
                    status VARCHAR NOT NULL,
                    current_period_start TIMESTAMP NOT NULL,
                    current_period_end TIMESTAMP NOT NULL,
                    cancel_at_period_end BOOLEAN DEFAULT FALSE,
                    canceled_at TIMESTAMP,
                    trial_start TIMESTAMP,
                    trial_end TIMESTAMP,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);"))


            # 2. Create invoices table
            print("Creating invoices table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
                    stripe_payment_intent_id VARCHAR(255),
                    amount_cents INTEGER NOT NULL,
                    currency VARCHAR(3) DEFAULT 'usd',
                    status VARCHAR DEFAULT 'draft',
                    invoice_pdf_url TEXT,
                    paid_at TIMESTAMP,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_invoices_user_created ON invoices(user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);"))

            print("✅ Iteration 11 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_billing_v11())
