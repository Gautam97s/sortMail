import asyncio
import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set strict env vars for connection
# URL Encoded password: @ -> %40
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:6543/postgres")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("GOOGLE_CLIENT_ID", "mock")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "mock")
os.environ.setdefault("GOOGLE_REDIRECT_URI", "mock")
os.environ.setdefault("MICROSOFT_REDIRECT_URI", "mock")
os.environ.setdefault("JWT_SECRET", "mock")

from core.storage.database import engine

async def migrate():
    print("🚀 Migrating User table...")
    async with engine.begin() as conn:
        try:
            # Check if column exists
            print("Checking if column exists...")
            # This is a brute-force add, failure if exists is caught or ignored if you want. 
            # Better: "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;"
            # PostgreSQL supports IF NOT EXISTS for columns in newer versions, but let's be safe.
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;"))
            print("✅ Column 'is_superuser' added successfully.")
        except Exception as e:
            print(f"⚠️ Migration warning (might already exist): {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
