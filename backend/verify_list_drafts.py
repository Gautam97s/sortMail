
import asyncio
import json
from sqlalchemy import select
from core.storage.database import async_session_factory
from models.draft import Draft, DraftStatus
from models.thread import Thread
from models.user import User

async def verify_list_drafts():
    async with async_session_factory() as session:
        # Get a user to simulate (assuming there's at least one)
        user_stmt = select(User).limit(1)
        user_res = await session.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        
        if not user:
            print("No user found in DB")
            return

        print(f"Verifying for user: {user.id}")
        
        # Simulate the logic in list_drafts
        stmt = (
            select(Draft, Thread.external_id)
            .join(Thread, Thread.id == Draft.thread_id)
            .where(
                Draft.user_id == user.id,
                Draft.status == DraftStatus.GENERATED.value
            )
            .limit(5)
        )
        results = (await session.execute(stmt)).all()
        
        print(f"Found {len(results)} drafts")
        for d, ext_id in results:
            item = {
                "id": d.id,
                "thread_id": d.thread_id,
                "external_id": ext_id,
                "subject": d.subject,
                "body": d.body or d.content,
                "tone": d.tone.value if hasattr(d.tone, 'value') else str(d.tone),
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else ""
            }
            print(json.dumps(item, indent=2))
            if not ext_id:
                print("ERORR: external_id is missing!")
            else:
                print("SUCCESS: external_id is present")

if __name__ == "__main__":
    asyncio.run(verify_list_drafts())
