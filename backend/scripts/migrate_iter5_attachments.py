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

async def migrate_attachments_v5():
    print("🚀 Iteration 5: Migrating Attachments & Vector Search...")
    async with engine.begin() as conn:
        try:
            # 1. Update attachments table
            print("Updating attachments table...")
            
            # Handle column renaming/migration if needed (message_id -> email_id)
            # Assuming we can just add email_id for now and backfill manually if needed, or alias it.
            # If message_id exists, we can try to rename it or add email_id and copy.
            try:
                await conn.execute(text("ALTER TABLE attachments RENAME COLUMN message_id TO email_id;"))
            except Exception:
                # If renaming fails (e.g. doesn't exist or already renamed), just ensure email_id exists
                await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS email_id VARCHAR;"))

            # Schema updates
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS external_id VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS filename_sanitized VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS content_type VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS sha256_hash VARCHAR;"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS storage_provider VARCHAR DEFAULT 's3';"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR;"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS skip_reason VARCHAR;"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS extracted_text TEXT;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS extraction_method VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS extraction_language VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS extraction_confidence INTEGER;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS chunk_count INTEGER DEFAULT 0;"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS virus_scan_result VARCHAR;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS virus_scan_details TEXT;"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';"))
            
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();"))
            
            # Constraints & Indexes
            # Note: We can't easily check for constraint existence in raw sql without querying catalog.
            # We'll rely on IF NOT EXISTS or try/except blocks in specific tools, 
            # but for this script we'll just add indexes which support IF NOT EXISTS.
            
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_attachments_email ON attachments(email_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_attachments_user ON attachments(user_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_attachments_hash ON attachments(sha256_hash) WHERE sha256_hash IS NOT NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_attachments_status ON attachments(status) WHERE status IN ('pending', 'processing');"))


            # 2. Create vector_documents table
            print("Creating vector_documents table...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS vector_documents (
                    id VARCHAR PRIMARY KEY,
                    user_id VARCHAR NOT NULL REFERENCES users(id),
                    source_type VARCHAR NOT NULL,
                    source_id VARCHAR NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    chunk_text TEXT NOT NULL,
                    chunk_tokens INTEGER NOT NULL,
                    embedding_model VARCHAR NOT NULL,
                    vector_db_id VARCHAR NOT NULL UNIQUE,
                    vector_db_collection VARCHAR NOT NULL,
                    indexed_at TIMESTAMP NOT NULL,
                    metadata_json JSONB DEFAULT '{}',
                    deleted_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_vector_docs_user_source ON vector_documents(user_id, source_type, source_id) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_vector_docs_chroma_id ON vector_documents(vector_db_id);"))

            print("✅ Iteration 5 Completed Successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            raise

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_attachments_v5())
