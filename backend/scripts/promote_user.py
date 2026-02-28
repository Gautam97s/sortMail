import asyncio
from sqlalchemy import update
from core.storage.database import async_session, engine
from models.user import User

async def promote_user(email: str):
    async with async_session() as session:
        stmt = update(User).where(User.email == email).values(is_superuser=True)
        result = await session.execute(stmt)
        await session.commit()
        if result.rowcount > 0:
            print(f"✅ User {email} promoted to superuser.")
        else:
            print(f"❌ User {email} not found.")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "verify@example.com"
    asyncio.run(promote_user(email))
