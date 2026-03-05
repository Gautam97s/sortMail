import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings

async def main():
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://').replace('postgres://', 'postgresql+asyncpg://')
    engine = create_async_engine(db_url)
    Sess = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Sess() as db:
        try:
            r = await db.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'draftstatus'"))
            print('status:', [x[0] for x in r.all()])
        except Exception as e:
            print('err1', e)
        try:
            r = await db.execute(text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'drafttone'"))
            print('tone:', [x[0] for x in r.all()])
        except Exception as e:
            print('err2', e)

asyncio.run(main())
