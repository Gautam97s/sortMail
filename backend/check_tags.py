import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from core.storage.database import async_session
from models.user import User
from models.thread import Thread
from models.tag import Tag
from models.contact import Contact

async def main():
    async with async_session() as db:
        stmt = select(User).limit(1)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            print("No users found.")
            return
            
        print(f"Checking data for user: {user.email}")
        
        # Check if any tags exist
        tag_stmt = select(Tag).where(Tag.user_id == user.id)
        tag_result = await db.execute(tag_stmt)
        tags = tag_result.scalars().all()
        print(f"Total tags found in DB: {len(tags)}")
        for tag in tags:
            print(f"- Tag: {tag.name} (ID: {tag.id})")
        
        # Check threads and their tags
        thread_stmt = select(Thread).options(selectinload(Thread.tags)).where(Thread.user_id == user.id).limit(5)
        thread_result = await db.execute(thread_stmt)
        threads = thread_result.scalars().all()
        
        print("\nThreads and their tags:")
        for t in threads:
            t_tags = [tag.name for tag in t.tags]
            print(f"- Thread: {t.subject} | Tags: {t_tags}")
            
        # Check contacts and their tags
        contact_stmt = select(Contact).options(selectinload(Contact.tags)).where(Contact.user_id == user.id).limit(10)
        contact_result = await db.execute(contact_stmt)
        contacts = contact_result.scalars().all()
        
        print("\nContacts and their tags:")
        for c in contacts:
            c_tags = [tag.name for tag in c.tags]
            if c_tags:
                print(f"- Contact: {c.email_address} ({c.name}) | Tags: {c_tags}")

if __name__ == "__main__":
    asyncio.run(main())
