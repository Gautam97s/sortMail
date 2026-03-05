import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from core.storage.database import async_session
from models.user import User
from models.thread import Thread

async def main():
    async with async_session() as db:
        stmt = select(User).limit(1)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            print("No users found to test with.")
            return
            
        print(f"Testing with user: {user.email}")
        
        stmt = select(Thread).where(
            Thread.user_id == user.id,
            Thread.intel_json['follow_up_needed'].astext == 'true'
        ).order_by(Thread.last_email_at.desc().nullslast())
        
        result = await db.execute(stmt)
        threads = result.scalars().all()
        
        from contracts import WaitingForDTOv1
        from datetime import datetime, timezone
        
        print(f"Found {len(threads)} threads needing follow-up.")
        now = datetime.now(timezone.utc)
        for t in threads:
            print(f"- Processing: {t.subject} (ID: {t.id})")
            
            # Get primary recipient (first participant that isn't the current user)
            recipient = "Unknown"
            if t.participants:
                for p in t.participants:
                    if user.email not in p:
                        recipient = p
                        break
            
            last_sent = t.last_email_at or now
            days_waiting = (now - last_sent).days if now > last_sent else 0
            
            # This will raise ValidationError if I missed any fields
            dto = WaitingForDTOv1(
                waiting_id=t.id,
                thread_id=t.id,
                user_id=str(t.user_id),
                last_sent_at=last_sent,
                days_waiting=days_waiting,
                recipient=recipient,
                thread_subject=t.subject or "(No Subject)",
                thread_summary=t.summary or "Waiting for reply...",
                reminded=False
            )
            print(f"  ✅ DTO created successfully for {dto.recipient}")

if __name__ == "__main__":
    asyncio.run(main())
