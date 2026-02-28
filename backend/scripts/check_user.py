import asyncio
from sqlalchemy import select
from core.storage.database import async_session
from models.user import User

async def check_user(email: str):
    async with async_session() as session:
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            print(f"👤 User: {user.email}")
            print(f"🆔 ID: {user.id}")
            print(f"👑 Superuser: {user.is_superuser}")
            print(f"📁 Status: {user.status}")
        else:
            print(f"❌ User {email} not found.")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "verify@example.com"
    asyncio.run(check_user(email))
