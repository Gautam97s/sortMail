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

async def migrate_health_v18():
    print("🚀 Iteration 18: Migrating System Health & Monitoring...")
    async with engine.begin() as conn:
        try:
            # 1. Create health_checks table
            print("Creating health_checks table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS health_checks (
                    id VARCHAR PRIMARY KEY,
                    component VARCHAR NOT NULL,
                    status VARCHAR NOT NULL,
                    response_time_ms INTEGER,
                    error_message TEXT,
                    checked_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    metadata_json JSONB DEFAULT '{}'
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_health_checks_component_time ON health_checks(component, checked_at DESC);"))


            # 2. Create error_logs table
            print("Creating error_logs table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS error_logs (
                    id VARCHAR PRIMARY KEY,
                    error_type VARCHAR(100) NOT NULL,
                    error_message TEXT NOT NULL,
                    stack_trace TEXT,
                    severity VARCHAR DEFAULT 'error',
                    user_id VARCHAR REFERENCES users(id),
                    request_path VARCHAR(500),
                    request_method VARCHAR(10),
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    context JSONB DEFAULT '{}',
                    resolved BOOLEAN DEFAULT FALSE,
                    resolved_at TIMESTAMP,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_error_logs_type_created ON error_logs(error_type, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity, created_at DESC) WHERE severity IN ('error', 'critical');"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(created_at DESC) WHERE resolved = false;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id) WHERE user_id IS NOT NULL;"))


            # 3. Create rate_limit_violations table
            print("Creating rate_limit_violations table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS rate_limit_violations (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR REFERENCES users(id),
                    ip_address VARCHAR(45) NOT NULL,
                    endpoint VARCHAR(255) NOT NULL,
                    limit_type VARCHAR NOT NULL,
                    limit_value INTEGER NOT NULL,
                    actual_value INTEGER NOT NULL,
                    blocked BOOLEAN DEFAULT TRUE,
                    user_agent TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rate_violations_user ON rate_limit_violations(user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rate_violations_ip ON rate_limit_violations(ip_address, created_at DESC);"))
            
            print("✅ Iteration 18 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_health_v18())
