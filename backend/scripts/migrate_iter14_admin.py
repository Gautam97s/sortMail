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

async def migrate_admin_v14():
    print("🚀 Iteration 14: Migrating Admin & Moderation System...")
    async with engine.begin() as conn:
        try:
            # 1. Create admin_users table
            print("Creating admin_users table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admin_users (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
                    role VARCHAR DEFAULT 'readonly',
                    permissions TEXT[] DEFAULT '{}',
                    can_impersonate BOOLEAN DEFAULT FALSE,
                    can_adjust_credits BOOLEAN DEFAULT FALSE,
                    can_view_analytics BOOLEAN DEFAULT FALSE,
                    can_manage_users BOOLEAN DEFAULT FALSE,
                    can_manage_billing BOOLEAN DEFAULT FALSE,
                    last_admin_action_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id) WHERE is_active = true;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);"))


            # 2. Create admin_audit_log table
            print("Creating admin_audit_log table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admin_audit_log (
                    id VARCHAR PRIMARY KEY,
                    admin_user_id VARCHAR NOT NULL REFERENCES admin_users(id),
                    action_type VARCHAR NOT NULL,
                    target_user_id VARCHAR REFERENCES users(id),
                    action_details TEXT NOT NULL,
                    before_state JSONB,
                    after_state JSONB,
                    ip_address VARCHAR(45) NOT NULL,
                    user_agent TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_created ON admin_audit_log(admin_user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admin_audit_target_created ON admin_audit_log(target_user_id, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admin_audit_action_created ON admin_audit_log(action_type, created_at DESC);"))


            # 3. Create abuse_reports table
            print("Creating abuse_reports table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS abuse_reports (
                    id VARCHAR PRIMARY KEY,
                    reporter_user_id VARCHAR REFERENCES users(id),
                    reported_user_id VARCHAR NOT NULL REFERENCES users(id),
                    report_type VARCHAR NOT NULL,
                    severity VARCHAR DEFAULT 'low',
                    description TEXT NOT NULL,
                    evidence JSONB DEFAULT '{}',
                    status VARCHAR DEFAULT 'pending',
                    assigned_to_admin_id VARCHAR REFERENCES admin_users(id),
                    resolution_notes TEXT,
                    resolved_at TIMESTAMP,
                    auto_detected BOOLEAN DEFAULT FALSE,
                    detection_rule VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status, created_at DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_abuse_reports_reported_user ON abuse_reports(reported_user_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_abuse_reports_assigned ON abuse_reports(assigned_to_admin_id) WHERE status = 'investigating';"))
            
            print("✅ Iteration 14 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_admin_v14())
