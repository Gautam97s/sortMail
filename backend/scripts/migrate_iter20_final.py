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

async def migrate_final_v20():
    print("🚀 Iteration 20: Migrating Final Modules (Rules, Translations, API Keys)...")
    async with engine.begin() as conn:
        try:
            # 1. Module 18: Email Rules
            print("Creating email_rules table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS email_rules (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    priority INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    conditions JSONB NOT NULL,
                    actions JSONB NOT NULL,
                    match_all_conditions BOOLEAN DEFAULT TRUE,
                    apply_to_existing BOOLEAN DEFAULT FALSE,
                    times_triggered BIGINT DEFAULT 0,
                    last_triggered_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_email_rules_user_priority ON email_rules(user_id, priority) WHERE is_active = true;"))

            print("Creating rule_execution_log table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS rule_execution_log (
                    id VARCHAR PRIMARY KEY,
                    rule_id VARCHAR NOT NULL REFERENCES email_rules(id),
                    thread_id VARCHAR NOT NULL REFERENCES threads(id),
                    email_id VARCHAR NOT NULL REFERENCES emails(id),
                    conditions_matched JSONB NOT NULL,
                    actions_executed JSONB NOT NULL,
                    success BOOLEAN NOT NULL,
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rule_execution_rule ON rule_execution_log(rule_id, created_at DESC);"))


            # 2. Module 19: Multi-Language
            print("Creating translations table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS translations (
                    id VARCHAR PRIMARY KEY,
                    key VARCHAR(255) NOT NULL,
                    locale VARCHAR(10) NOT NULL,
                    value TEXT NOT NULL,
                    context VARCHAR(255),
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT uq_translation_key_locale UNIQUE (key, locale)
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_translations_key_locale ON translations(key, locale);"))


            # 3. Module 20: API Keys
            print("Creating api_keys table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS api_keys (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    name VARCHAR(255) NOT NULL,
                    key_prefix VARCHAR(20) NOT NULL,
                    key_hash VARCHAR(64) NOT NULL UNIQUE,
                    scopes TEXT[] NOT NULL,
                    rate_limit_per_hour INTEGER DEFAULT 1000,
                    last_used_at TIMESTAMP,
                    last_used_ip VARCHAR(45),
                    usage_count BIGINT DEFAULT 0,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id) WHERE is_active = true;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);"))

            print("✅ Iteration 20 (Final Modules) Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_final_v20())
