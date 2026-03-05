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
            r = await db.execute(text("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'drafts' AND column_name IN ('status', 'tone')"))
            for row in r.all():
                print(dict(row._mapping))
        except Exception as e:
            print('err', e)

asyncio.run(main())
