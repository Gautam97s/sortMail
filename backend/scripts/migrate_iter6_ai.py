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

async def migrate_ai_core_v6():
    print("🚀 Iteration 6: Migrating AI Core (Queue & Logs)...")
    async with engine.begin() as conn:
        try:
            # 1. Create ai_processing_queue table
            print("Creating ai_processing_queue table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_processing_queue (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    operation_type VARCHAR NOT NULL,
                    entity_type VARCHAR NOT NULL,
                    entity_id VARCHAR NOT NULL,
                    priority INTEGER DEFAULT 5,
                    status VARCHAR DEFAULT 'pending',
                    attempts INTEGER DEFAULT 0,
                    max_attempts INTEGER DEFAULT 3,
                    reserved_at TIMESTAMP,
                    reserved_by_worker VARCHAR,
                    reservation_expires_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    failed_at TIMESTAMP,
                    error_message TEXT,
                    input_context JSONB,
                    result JSONB,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_queue_pending ON ai_processing_queue(priority, created_at) WHERE status = 'pending';"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_queue_reserved ON ai_processing_queue(reservation_expires_at) WHERE status = 'reserved';"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_queue_user_entity ON ai_processing_queue(user_id, entity_type, entity_id);"))


            # 2. Create ai_usage_logs table
            print("Creating ai_usage_logs table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_usage_logs (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    operation_type VARCHAR NOT NULL,
                    provider VARCHAR NOT NULL,
                    model_name VARCHAR NOT NULL,
                    tokens_input INTEGER NOT NULL,
                    tokens_output INTEGER NOT NULL,
                    tokens_total INTEGER NOT NULL,
                    cost_cents INTEGER NOT NULL,
                    credits_charged INTEGER,
                    latency_ms INTEGER,
                    cache_hit BOOLEAN DEFAULT FALSE,
                    related_entity_type VARCHAR,
                    related_entity_id VARCHAR,
                    request_id VARCHAR,
                    error_occurred BOOLEAN DEFAULT FALSE,
                    error_type VARCHAR,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_logs_user_created ON ai_usage_logs(user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_logs_operation ON ai_usage_logs(operation_type, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_logs_cost ON ai_usage_logs(created_at) WHERE cost_cents > 0;"))


            # 3. Create ai_usage_daily_summary table
            print("Creating ai_usage_daily_summary table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_usage_daily_summary (
                    id VARCHAR PRIMARY KEY,
                    date DATE NOT NULL,
                    user_id VARCHAR REFERENCES users(id),
                    operation_type VARCHAR,
                    total_operations INTEGER NOT NULL,
                    total_tokens BIGINT NOT NULL,
                    total_cost_cents BIGINT NOT NULL,
                    total_credits_charged BIGINT,
                    avg_latency_ms INTEGER,
                    cache_hit_rate DECIMAL(5,2),
                    error_rate DECIMAL(5,2),
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_summary_date_user ON ai_usage_daily_summary(date DESC, user_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ai_summary_date_op ON ai_usage_daily_summary(date DESC, operation_type);"))
            
            # Constraint: Unique (date, user_id, operation_type)
            # Need to handle potential explicit constraint name
            try:
                await conn.execute(text("ALTER TABLE ai_usage_daily_summary ADD CONSTRAINT unique_daily_usage UNIQUE (date, user_id, operation_type);"))
            except Exception:
                print("Constraint unique_daily_usage might already exist or failed.")

            print("✅ Iteration 6 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_ai_core_v6())
