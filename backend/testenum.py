import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run():
    engine = create_async_engine('postgresql+asyncpg://postgres.lsqeeoysmyonkiaphvhz:SortmailRounak%406789@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?ssl=require')
    async with engine.connect() as conn:
        res1 = await conn.execute(text("SELECT enum_range(NULL::taskstatus)"))
        print("taskstatus ranges:", res1.scalar())
        res2 = await conn.execute(text("SELECT enum_range(NULL::tasktype)"))
        print("tasktype ranges:", res2.scalar())

asyncio.run(run())
