import asyncio
import os
from sqlalchemy import select
from core.storage.database import async_session
from models.attachment import Attachment

async def main():
    async with async_session() as session:
        att_id = "att-ANGjdJ9anjDObZ6GcrwRQMKNIgzeEdpFphhc5wlsvybSI0TrUdOk5qGvoDNLDk7f69DuujScxLfAzQ2opdffKAnH6DI_0LeueRXkR11laEtD4Ll4-kS1NSDTz30PRt9MFqnh6KdgGMC4-zvwhDFgvUUHLliELK5RRwTAgZg78ZHG2GgVqrQqxxjBg2YeKmU8szidZJwKs8Ixar7judL4DVAFdU3SkXKmyE1lso7WKZXcKkZsMrr7QDWFFwPSnnoQNBxUqsrifCbgbKPBvMjOYY_Ip_aTeAZmS059yl7h4I1v0q_NMYWsiJ0jvjyCZ3hoXqEojxDMrZjh1NFFwz_pAi_BAWRce0LFyQeGq1fdMtKcJmL4hkW8aJbhWrseJtJcMusp3pWa9tDGsatDgFUg"
        stmt = select(Attachment).where(Attachment.id == att_id)
        result = await session.execute(stmt)
        att = result.scalars().first()
        if att:
            print(f"FOUND: {att.id} user={att.user_id} path={att.storage_path}")
        else:
            print("NOT FOUND")
            
        # Count all
        stmt = select(Attachment)
        result = await session.execute(stmt)
        all_atts = result.scalars().all()
        print(f"Total attachments in DB: {len(all_atts)}")
        for a in all_atts[:5]:
            print(f"Sample DB ID: {a.id} user={a.user_id} path={a.storage_path}")

asyncio.run(main())
