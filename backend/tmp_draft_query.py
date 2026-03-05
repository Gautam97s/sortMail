import asyncio
from sqlalchemy import select
from core.storage.database import async_session_factory
from models.draft import Draft

async def check_drafts():
    async with async_session_factory() as db:
        res = await db.execute(select(Draft).limit(10))
        drafts = res.scalars().all()
        print(f"Found {len(drafts)} drafts.")
        for d in drafts:
            print(f"- ID: {d.id}, Thread ID: {d.thread_id}, Status: {d.status}, Tone: {d.tone}")

if __name__ == "__main__":
    asyncio.run(check_drafts())
