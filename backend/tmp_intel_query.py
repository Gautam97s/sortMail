import asyncio
import os
import sys
old_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w')
from sqlalchemy import select
from core.storage.database import async_session_factory
from models.thread import Thread
import json
sys.stdout = old_stdout

async def check_intel():
    async with async_session_factory() as db:
        res = await db.execute(select(Thread).where(Thread.intel_json.is_not(None)).limit(10))
        threads = res.scalars().all()
        print(f"--- Found {len(threads)} threads with intelligence ---")
        for t in threads:
            intel = t.intel_json
            sd = intel.get('suggested_draft')
            print(f"- Thread ID: {t.id}")
            print(f"  Suggested Draft type: {type(sd)}")
            print(f"  Suggested Draft value: {sd[:50] if isinstance(sd, str) else sd}")

if __name__ == "__main__":
    asyncio.run(check_intel())
