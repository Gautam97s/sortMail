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

async def migrate_jobs_v17():
    print("🚀 Iteration 17: Migrating Jobs & Queues System...")
    async with engine.begin() as conn:
        try:
            # 1. Create job_queue table
            print("Creating job_queue table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS job_queue (
                    id VARCHAR PRIMARY KEY,
                    job_type VARCHAR(100) NOT NULL,
                    priority INTEGER DEFAULT 5,
                    payload JSONB NOT NULL,
                    status VARCHAR DEFAULT 'pending',
                    attempts INTEGER DEFAULT 0,
                    max_attempts INTEGER DEFAULT 3,
                    reserved_at TIMESTAMP,
                    reserved_by_worker VARCHAR(100),
                    reservation_expires_at TIMESTAMP,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    failed_at TIMESTAMP,
                    error_message TEXT,
                    scheduled_for TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_jobs_pending ON job_queue(priority, created_at) WHERE status = 'pending';"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_jobs_reserved_expires ON job_queue(reservation_expires_at) WHERE status = 'reserved';"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON job_queue(job_type, status, created_at DESC);"))


            # 2. Create scheduled_jobs table
            print("Creating scheduled_jobs table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS scheduled_jobs (
                    id VARCHAR PRIMARY KEY,
                    job_name VARCHAR(255) NOT NULL UNIQUE,
                    job_type VARCHAR(100) NOT NULL,
                    schedule_expression VARCHAR(100) NOT NULL,
                    payload_template JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_run_at TIMESTAMP,
                    next_run_at TIMESTAMP NOT NULL,
                    run_count BIGINT DEFAULT 0,
                    failure_count INTEGER DEFAULT 0,
                    last_error TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at) WHERE is_active = true;"))
            
            print("✅ Iteration 17 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_jobs_v17())
