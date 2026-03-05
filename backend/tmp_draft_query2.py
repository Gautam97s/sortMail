import asyncio
import os
import sys
# silence stdout temporarily
old_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w')
from sqlalchemy import select
from core.storage.database import async_session_factory
from models.draft import Draft
sys.stdout = old_stdout

async def check_drafts():
    async with async_session_factory() as db:
        res = await db.execute(select(Draft).limit(10))
        drafts = res.scalars().all()
        print(f"--- Found {len(drafts)} drafts ---")
        for d in drafts:
            print(f"- ID: {d.id}, Thread ID: {d.thread_id}, Status: {d.status}, Tone: {d.tone}")

if __name__ == "__main__":
    asyncio.run(check_drafts())
