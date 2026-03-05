import asyncio
import os
import uuid
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.config import settings
from models.draft import Draft, DraftStatus, DraftTone

async def main():
    db_url = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://').replace('postgres://', 'postgresql+asyncpg://')
    engine = create_async_engine(db_url)
    Sess = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with Sess() as db:
        res_user = await db.execute(text("SELECT id FROM users LIMIT 1"))
        user_row = res_user.first()
        if not user_row: return
        user_id = user_row[0]
        
        res_thread = await db.execute(text("SELECT id FROM threads WHERE user_id = :uid LIMIT 1"), {"uid": user_id})
        thread_row = res_thread.first()
        if not thread_row: return
        thread_id = thread_row[0]
        
        try:
            draft = Draft(
                id=str(uuid.uuid4()),
                user_id=user_id,
                thread_id=thread_id,
                subject="Re: Test subject",
                content="This is an auto-generated test draft.",
                body="This is an auto-generated test draft.",
                tone=DraftTone.NORMAL,
                generation_model="test-script",
                status=DraftStatus.GENERATED.value 
            )
            db.add(draft)
            await db.commit()
            print("OK")
            
        except Exception as e:
            await db.rollback()
            import traceback
            with open("error_trace.txt", "w") as f:
                f.write(traceback.format_exc())

asyncio.run(main())
