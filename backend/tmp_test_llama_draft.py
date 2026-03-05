import asyncio
import os
import sys

old_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w')
from sqlalchemy import select
from core.storage.database import async_session_factory
from core.intelligence.pipeline import process_thread_intelligence
from models.thread import Thread
from models.draft import Draft
sys.stdout = old_stdout

async def test_draft_gen():
    async with async_session_factory() as db:
        # Get a thread
        res = await db.execute(select(Thread).limit(1))
        thread = res.scalars().first()
        if not thread:
            print("No threads to analyze")
            return
            
        print(f"Testing intelligence on Thread ID: {thread.id} (Subject: {thread.subject})")
        
        await process_thread_intelligence(thread.id, thread.user_id, db)
        
        # Check if draft was created
        d_res = await db.execute(select(Draft).where(Draft.thread_id == thread.id))
        drafts = d_res.scalars().all()
        print(f"Drafts created for thread: {len(drafts)}")
        for d in drafts:
            print(f" - [{d.status}] Tone: {d.tone} | Body: {d.body[:80]}")

if __name__ == "__main__":
    asyncio.run(test_draft_gen())
