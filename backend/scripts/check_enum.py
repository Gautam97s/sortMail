import asyncio
import os
import sys

# Add backend dir to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.storage.database import async_engine
from sqlalchemy import text

async def get_enums():
    try:
        async with async_engine.connect() as conn:
            res1 = await conn.execute(text("SELECT enum_range(NULL::taskstatus);"))
            print("taskstatus:", res1.scalar())
            
            res2 = await conn.execute(text("SELECT enum_range(NULL::tasktype);"))
            print("tasktype:", res2.scalar())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(get_enums())
