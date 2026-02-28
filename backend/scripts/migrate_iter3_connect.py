import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set strict env vars for connection
# URL Encoded password: @ -> %40
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")

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

async def migrate_connect_v3():
    print("🚀 Iteration 3: Migrating Connect Module...")
    async with engine.begin() as conn:
        try:
            # 1. Update connected_accounts table
            print("Updating connected_accounts table...")
            
            # Add new columns
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS provider_email VARCHAR;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS scopes VARCHAR;"))
            
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS error_code VARCHAR;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS error_message VARCHAR;"))
            
            # Sync Config
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS initial_sync_done BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS sync_window_days INTEGER DEFAULT 90;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT TRUE;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS sync_frequency_minutes INTEGER DEFAULT 15;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS last_watch_expires_at TIMESTAMP;"))
            
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Drop old constraint if exists and add new one with soft delete support
            # Note: Dropping constraints by name is tricky if name is unknown. 
            # Assuming 'unique_user_provider' or similar.
            try:
                await conn.execute(text("ALTER TABLE connected_accounts DROP CONSTRAINT IF EXISTS unique_user_provider;"))
                await conn.execute(text("ALTER TABLE connected_accounts DROP CONSTRAINT IF EXISTS connected_accounts_user_id_provider_key;")) # Default name
            except Exception as e:
                print(f"Warning dropping constraint: {e}")
                
            # Create indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_provider ON connected_accounts(user_id, provider) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_connected_accounts_status ON connected_accounts(status);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_connected_accounts_sync ON connected_accounts(sync_status) WHERE sync_enabled = true;"))
            
            
            # 2. Create oauth_state_tokens table
            print("Creating oauth_state_tokens table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS oauth_state_tokens (
                    id VARCHAR PRIMARY KEY,
                    state_token VARCHAR NOT NULL UNIQUE,
                    user_id VARCHAR,
                    code_verifier VARCHAR NOT NULL,
                    provider VARCHAR NOT NULL,
                    ip_address VARCHAR NOT NULL,
                    user_agent VARCHAR NOT NULL,
                    redirect_after_auth VARCHAR,
                    expires_at TIMESTAMP NOT NULL,
                    consumed BOOLEAN DEFAULT FALSE,
                    consumed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_oauth_state_token ON oauth_state_tokens(state_token) WHERE consumed = false;"))

            print("✅ Iteration 3 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_connect_v3())
