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

async def migrate_retention_v16():
    print("🚀 Iteration 16: Migrating Retention & Compliance System...")
    async with engine.begin() as conn:
        try:
            # 1. Create data_retention_policies table
            print("Creating data_retention_policies table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS data_retention_policies (
                    id VARCHAR PRIMARY KEY,
                    entity_type VARCHAR(100) NOT NULL,
                    retention_days INTEGER NOT NULL,
                    applies_to_deleted BOOLEAN DEFAULT TRUE,
                    applies_to_active BOOLEAN DEFAULT FALSE,
                    user_configurable BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))


            # 2. Create gdpr_requests table
            print("Creating gdpr_requests table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS gdpr_requests (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    request_type VARCHAR NOT NULL,
                    status VARCHAR DEFAULT 'pending',
                    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    completed_at TIMESTAMP,
                    export_file_url TEXT,
                    export_expires_at TIMESTAMP,
                    deletion_confirmed BOOLEAN DEFAULT FALSE,
                    deletion_completed_at TIMESTAMP,
                    admin_notes TEXT,
                    metadata_json JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_status ON gdpr_requests(user_id, status);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_gdpr_requests_pending ON gdpr_requests(requested_at) WHERE status = 'pending';"))


            # 3. Create consent_records table
            print("Creating consent_records table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS consent_records (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    consent_type VARCHAR NOT NULL,
                    version VARCHAR(20) NOT NULL,
                    consented BOOLEAN NOT NULL,
                    consent_method VARCHAR,
                    ip_address VARCHAR(45) NOT NULL,
                    user_agent TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_consent_user_type ON consent_records(user_id, consent_type, created_at DESC);"))
            
            print("✅ Iteration 16 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_retention_v16())
