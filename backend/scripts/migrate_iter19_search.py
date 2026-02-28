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

async def migrate_search_v19():
    print("🚀 Iteration 19: Migrating Search & Indexing System...")
    async with engine.begin() as conn:
        try:
            # 1. Create search_queries table
            print("Creating search_queries table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS search_queries (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    query_text TEXT NOT NULL,
                    search_type VARCHAR DEFAULT 'keyword',
                    filters_applied JSONB DEFAULT '{}',
                    results_count INTEGER NOT NULL,
                    clicked_result_id VARCHAR,
                    latency_ms INTEGER,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_search_queries_user_created ON search_queries(user_id, created_at DESC);"))
            # Full text index (simple example)
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_search_queries_text ON search_queries USING GIN(to_tsvector('english', query_text));"))


            # 2. Create saved_searches table
            print("Creating saved_searches table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS saved_searches (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    name VARCHAR(255) NOT NULL,
                    query_text TEXT NOT NULL,
                    filters JSONB DEFAULT '{}',
                    is_smart_folder BOOLEAN DEFAULT FALSE,
                    notification_enabled BOOLEAN DEFAULT FALSE,
                    last_used_at TIMESTAMP,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """))
            
            # Indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id, created_at DESC);"))
            
            print("✅ Iteration 19 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_search_v19())
