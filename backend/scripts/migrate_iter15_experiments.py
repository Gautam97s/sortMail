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

async def migrate_experiments_v15():
    print("🚀 Iteration 15: Migrating Experiments System...")
    async with engine.begin() as conn:
        try:
            # 1. Create feature_flags table
            print("Creating feature_flags table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS feature_flags (
                    id VARCHAR PRIMARY KEY,
                    flag_key VARCHAR(100) NOT NULL UNIQUE,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    flag_type VARCHAR DEFAULT 'boolean',
                    default_value JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    rollout_percentage INTEGER DEFAULT 0,
                    targeting_rules JSONB DEFAULT '[]',
                    created_by_admin_id VARCHAR REFERENCES admin_users(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key) WHERE is_active = true;"))


            # 2. Create user_feature_overrides table
            print("Creating user_feature_overrides table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_feature_overrides (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    feature_flag_id VARCHAR NOT NULL REFERENCES feature_flags(id),
                    override_value JSONB NOT NULL,
                    reason TEXT,
                    set_by_admin_id VARCHAR REFERENCES admin_users(id),
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT uq_user_feature_override UNIQUE (user_id, feature_flag_id)
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_feature_overrides_user_flag ON user_feature_overrides(user_id, feature_flag_id);"))


            # 3. Create ab_experiments table
            print("Creating ab_experiments table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ab_experiments (
                    id VARCHAR PRIMARY KEY,
                    experiment_key VARCHAR(100) NOT NULL UNIQUE,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    hypothesis TEXT,
                    variants JSONB NOT NULL,
                    traffic_allocation JSONB NOT NULL,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP,
                    status VARCHAR DEFAULT 'draft',
                    winning_variant VARCHAR(50),
                    created_by_admin_id VARCHAR REFERENCES admin_users(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))


            # 4. Create ab_experiment_assignments table
            print("Creating ab_experiment_assignments table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ab_experiment_assignments (
                    id VARCHAR PRIMARY KEY,
                    experiment_id VARCHAR NOT NULL REFERENCES ab_experiments(id),
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    variant_key VARCHAR(50) NOT NULL,
                    assigned_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT uq_experiment_user_assignment UNIQUE (experiment_id, user_id)
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user ON ab_experiment_assignments(user_id, experiment_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON ab_experiment_assignments(experiment_id, variant_key);"))
            
            print("✅ Iteration 15 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_experiments_v15())
