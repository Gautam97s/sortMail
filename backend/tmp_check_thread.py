
import asyncio
from sqlalchemy import select
from core.storage.database import async_session_factory
from models.thread import Thread

async def check_thread():
    async with async_session_factory() as session:
        stmt = select(Thread).where(Thread.id == 'thread-19cba658887e9c12')
        result = await session.execute(stmt)
        thread = result.scalar_one_or_none()
        
        if thread:
            print(f"Thread ID: {thread.id}")
            print(f"External ID: {thread.external_id}")
            print(f"Provider: {thread.provider}")
        else:
            print("Thread not found")

if __name__ == "__main__":
    asyncio.run(check_thread())
