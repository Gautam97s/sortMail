import asyncio
import os
import re
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
            
        print(f"Verifying tag merging for user: {user.email}")
        
        # Check threads and merge with contact tags
        thread_stmt = select(Thread).options(selectinload(Thread.tags)).where(Thread.user_id == user.id).limit(10)
        thread_result = await db.execute(thread_stmt)
        threads = thread_result.scalars().all()
        
        # Merge logic simulation
        sender_emails = []
        for t in threads:
            if t.participants:
                p = t.participants[0]
                email_match = re.search(r'<(.+?)>', p)
                email = email_match.group(1).lower() if email_match else p.lower().strip()
                sender_emails.append(email)
        
        contact_map = {}
        if sender_emails:
            contact_stmt = select(Contact).where(
                Contact.user_id == user.id,
                Contact.email_address.in_(sender_emails)
            ).options(selectinload(Contact.tags))
            c_result = await db.execute(contact_stmt)
            for c in c_result.scalars().all():
                contact_map[c.email_address.lower()] = [tag.name for tag in c.tags]

        print("\nMerged Tags Verification:")
        for t in threads:
            t_tags_list = [tag.name for tag in t.tags]
            p = t.participants[0] if t.participants else ""
            email_match = re.search(r'<(.+?)>', p)
            email = email_match.group(1).lower() if email_match else p.lower().strip()
            c_tags = contact_map.get(email, [])
            merged = list(set(t_tags_list + c_tags))
            print(f"- Thread: {t.subject[:30]}...")
            print(f"  Sender: {email}")
            print(f"  Thread Tags: {t_tags_list}")
            print(f"  Contact Tags: {c_tags}")
            print(f"  Merged: {merged}")

if __name__ == "__main__":
    asyncio.run(main())
