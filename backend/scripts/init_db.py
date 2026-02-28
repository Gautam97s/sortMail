import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set mock environment variables to satisfy Pydantic validation
# We only need DATABASE_URL to be real (or defaulted if local)
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
# URL Encoded password: @ -> %40
os.environ.setdefault("DATABASE_URL", "postgresql://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres") 
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("GOOGLE_CLIENT_ID", "mock_client_id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "mock_client_secret")
os.environ.setdefault("GOOGLE_REDIRECT_URI", "http://localhost:8000/callback")
os.environ.setdefault("MICROSOFT_REDIRECT_URI", "http://localhost:8000/callback")
os.environ.setdefault("JWT_SECRET", "mock_secret")

from core.storage.database import init_db, engine
# Import all models to ensure they are registered with Base.metadata
from models import * 

async def main():
    print("🚀 Initializing Database...")
    print(f"Connecting to: {engine.url}")
    try:
        await init_db()
        print("✅ Tables created successfully.")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        # Print full traceback for debugging
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
