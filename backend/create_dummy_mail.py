import asyncio
import sys
import os
from datetime import datetime, timezone, timedelta

# Append backend dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.storage.database import async_session_factory
from models.thread import Thread
from models.email import Email
import uuid

async def create_dummy_data():
    async with async_session_factory() as db:
        user_id = "mock_user_123"
        from models.user import User, UserStatus, AccountType, EmailProvider
        from sqlalchemy import select
        
        # Ensure user exists
        db_user = await db.scalar(select(User).where(User.id == user_id))
        if not db_user:
            db_user = User(
                id=user_id,
                email="alex@example.com",
                name="Alex Rivera",
                provider=EmailProvider.GMAIL,
                status=UserStatus.ACTIVE,
                account_type=AccountType.INDIVIDUAL,
                is_superuser=False,
            )
            db.add(db_user)
            await db.commit()
            
        # 1. Thread 1 - Urgent
        t1_id = str(uuid.uuid4())
        thread1 = Thread(
            id=t1_id,
            user_id=user_id,
            external_id=f"ext_{t1_id}",
            subject="Urgent: Server Down in Production",
            participants=["ops@production.com", "alex@example.com"],
            provider="gmail",
            labels=["INBOX", "UNREAD", "IMPORTANT"],
            is_unread=1,
            is_starred=True,
            summary="Production server is experiencing high crash rates after the recent deployment.",
            intent="urgent",
            urgency_score=95,
            last_email_at=datetime.now(timezone.utc) - timedelta(minutes=5),
            intel_generated_at=datetime.now(timezone.utc),
        )
        email1 = Email(
            id=str(uuid.uuid4()),
            user_id=user_id,
            thread_id=t1_id,
            external_id=f"ext_mail_{t1_id}",
            sender="Ops Team <ops@production.com>",
            sender_name="Ops Team",
            recipients=[{"email": "alex@example.com", "name": "Alex Rivera", "type": "to"}],
            subject="Urgent: Server Down in Production",
            body_plain="Hey Alex,\nThe production server has been throwing 500s for the last ten minutes. Please check the logs ASAP.\n\nThanks,\nOps Team",
            body_html="<p>Hey Alex,</p><p>The production server has been throwing 500s for the last ten minutes. <b>Please check the logs ASAP.</b></p><p>Thanks,<br/>Ops Team</p>",
            snippet="The production server has been throwing...",
            received_at=datetime.now(timezone.utc) - timedelta(minutes=5),
            sent_at=datetime.now(timezone.utc) - timedelta(minutes=6),
        )

        # 2. Thread 2 - Action Required
        t2_id = str(uuid.uuid4())
        thread2 = Thread(
            id=t2_id,
            user_id=user_id,
            external_id=f"ext_{t2_id}",
            subject="Q3 Marketing Strategy Review",
            participants=["sarah@company.com", "alex@example.com"],
            provider="gmail",
            labels=["INBOX"],
            is_unread=0,
            summary="Sarah wants you to review the attached Q3 marketing slides before the meeting tomorrow.",
            intent="action_required",
            urgency_score=60,
            last_email_at=datetime.now(timezone.utc) - timedelta(hours=2),
            intel_generated_at=datetime.now(timezone.utc),
        )
        email2 = Email(
            id=str(uuid.uuid4()),
            user_id=user_id,
            thread_id=t2_id,
            external_id=f"ext_mail_{t2_id}",
            sender="Sarah Jenkins <sarah@company.com>",
            sender_name="Sarah Jenkins",
            recipients=[{"email": "alex@example.com", "name": "Alex Rivera", "type": "to"}],
            subject="Q3 Marketing Strategy Review",
            body_plain="Hi Alex, please review the slides before tomorrow.",
            snippet="Hi Alex, please review the slides before...",
            received_at=datetime.now(timezone.utc) - timedelta(hours=2),
            sent_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=4),
        )

        # 3. Thread 3 - FYI
        t3_id = str(uuid.uuid4())
        thread3 = Thread(
            id=t3_id,
            user_id=user_id,
            external_id=f"ext_{t3_id}",
            subject="Weekly Company Newsletter",
            participants=["newsletter@company.com"],
            provider="gmail",
            labels=["INBOX"],
            is_unread=1,
            summary="Weekly highlights from product and sales. No action required.",
            intent="fyi",
            urgency_score=10,
            last_email_at=datetime.now(timezone.utc) - timedelta(days=1),
            intel_generated_at=datetime.now(timezone.utc),
        )
        email3 = Email(
            id=str(uuid.uuid4()),
            user_id=user_id,
            thread_id=t3_id,
            external_id=f"ext_mail_{t3_id}",
            sender="Internal Comms <newsletter@company.com>",
            recipients=[{"email": "alex@example.com", "name": "Alex Rivera", "type": "to"}],
            subject="Weekly Company Newsletter",
            body_plain="Welcome to this week's newsletter...",
            snippet="Welcome to this week's newsletter...",
            received_at=datetime.now(timezone.utc) - timedelta(days=1),
            sent_at=datetime.now(timezone.utc) - timedelta(days=1, minutes=10),
        )

        try:
            db.add_all([thread1, thread2, thread3])
            await db.commit()

            db.add_all([email1, email2, email3])
            await db.commit()
            print("✅ Inserted dummy emails successfully!")
        except Exception as e:
            await db.rollback()
            with open("dummy_err_v2.txt", "w") as f:
                f.write(repr(e) + "\n\n")
                import traceback
                f.write(traceback.format_exc())
            print("❌ SQLAlchemy Error. See dummy_err_v2.txt")

if __name__ == "__main__":
    asyncio.run(create_dummy_data())
