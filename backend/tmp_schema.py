import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings

async def main():
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://').replace('postgres://', 'postgresql+asyncpg://')
    engine = create_async_engine(db_url)
    Sess = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Sess() as db:
        r = await db.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'drafts' ORDER BY ordinal_position"))
        cols = [dict(row._mapping) for row in r.all()]
        with open("drafts_schema.json", "w") as f:
            json.dump(cols, f, indent=2)

asyncio.run(main())
