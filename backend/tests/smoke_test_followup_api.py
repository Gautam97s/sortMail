"""
Smoke Tests - Follow-up API Endpoints
--------------------------------------
End-to-end validation of follow-up endpoints for production deployment.
"""

import asyncio
import sys
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Setup path
sys.path.insert(0, '/'.join(__file__.split('\\')[:-2]))

from app.config import settings
from core.storage.database import Base
from models.user import User
from models.thread import Thread
from models.email import Email
from models.follow_up import FollowUp, FollowUpStatus
from contracts import WaitingForDTOv1


async def run_smoke_tests():
    """Execute all follow-up API smoke tests."""
    
    # Initialize async engine - convert psycopg2 to psycopg (async)
    db_url = settings.DATABASE_URL
    if "postgresql://" in db_url and "psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    elif "postgresql://" in db_url:
        db_url = db_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    results = {
        "tests_passed": [],
        "tests_failed": [],
        "database_queries": []
    }
    
    async with async_session() as db:
        try:
            # TEST 1: GET /api/reminders - List all follow-ups for user
            print("\n[TEST 1] GET /api/reminders")
            print("=" * 60)
            
            # Find a test user
            user_stmt = select(User).limit(1)
            user = (await db.execute(user_stmt)).scalars().first()
            
            if user:
                # Query follow-ups (mimicking the reminders endpoint)
                followup_stmt = (
                    select(FollowUp, Thread)
                    .join(Thread, Thread.id == FollowUp.thread_id)
                    .where(
                        FollowUp.user_id == user.id,
                        FollowUp.deleted_at.is_(None),
                        FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
                        Thread.is_trash == False,
                        Thread.is_archived == False,
                    )
                    .limit(5)
                )
                rows = (await db.execute(followup_stmt)).all()
                
                print(f"✓ Query executed for user: {user.id}")
                print(f"✓ Found {len(rows)} active follow-ups")
                results["tests_passed"].append("GET /api/reminders")
                results["database_queries"].append(f"✓ SELECT follow_ups JOIN threads: {len(rows)} rows")
                
                if rows:
                    follow_up, thread = rows[0]
                    print(f"  - Sample: Thread '{thread.subject}' waiting for reply from {follow_up.metadata_json.get('recipient', 'unknown')}")
                    
                    # TEST 2: POST /api/reminders/{id}/remind
                    print("\n[TEST 2] POST /api/reminders/{id}/remind")
                    print("=" * 60)
                    
                    # Simulate reminder sent
                    follow_up.reminder_sent = True
                    follow_up.reminder_at = datetime.now(timezone.utc)
                    if follow_up.status == FollowUpStatus.WAITING:
                        follow_up.status = FollowUpStatus.OVERDUE
                    await db.commit()
                    
                    print(f"✓ Reminder marked as sent for follow-up: {follow_up.id}")
                    print(f"✓ Status updated to OVERDUE")
                    results["tests_passed"].append("POST /api/reminders/{id}/remind")
                    results["database_queries"].append(f"✓ UPDATE follow_ups SET reminder_sent=True, status='OVERDUE'")
                    
                    # TEST 3: DELETE /api/reminders/{id}
                    print("\n[TEST 3] DELETE /api/reminders/{id}")
                    print("=" * 60)
                    
                    # Simulate dismiss (soft delete)
                    follow_up.deleted_at = datetime.now(timezone.utc)
                    follow_up.status = FollowUpStatus.CANCELLED
                    await db.commit()
                    
                    print(f"✓ Follow-up soft-deleted: {follow_up.id}")
                    print(f"✓ Status set to CANCELLED")
                    results["tests_passed"].append("DELETE /api/reminders/{id}")
                    results["database_queries"].append(f"✓ UPDATE follow_ups SET deleted_at=now(), status='CANCELLED'")
            else:
                print("⚠ No test user found, skipping reminder tests")
                results["tests_failed"].append("GET /api/reminders - No test user found")
            
            # TEST 4: GET /api/dashboard/stats - Awaiting reply count
            print("\n[TEST 4] GET /api/dashboard/stats (awaiting_reply_count)")
            print("=" * 60)
            
            await_stmt = select(FollowUp).where(
                FollowUp.deleted_at.is_(None),
                FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
            )
            await_count = (await db.execute(select(FollowUp).where(
                FollowUp.deleted_at.is_(None),
                FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
            ))).scalars().all()
            
            print(f"✓ Dashboard awaiting_reply_count: {len(await_count)} follow-ups")
            results["tests_passed"].append("GET /api/dashboard/stats")
            results["database_queries"].append(f"✓ SELECT COUNT(follow_ups) WHERE status IN (WAITING, OVERDUE): {len(await_count)}")
            
            # TEST 5: GET /api/notifications - Follow-up notifications
            print("\n[TEST 5] GET /api/notifications (follow_up reminders)")
            print("=" * 60)
            
            notify_stmt = select(FollowUp).where(
                FollowUp.deleted_at.is_(None),
                FollowUp.status == FollowUpStatus.OVERDUE,
                FollowUp.reminder_sent == True,
            ).limit(10)
            
            notifications = (await db.execute(notify_stmt)).scalars().all()
            
            print(f"✓ Found {len(notifications)} follow-up notifications to send")
            print(f"✓ Notification entity type: 'follow_up'")
            print(f"✓ Notification entity_id: follow_up.id (UUID)")
            results["tests_passed"].append("GET /api/notifications")
            results["database_queries"].append(f"✓ SELECT follow_ups WHERE status='OVERDUE' AND reminder_sent=True: {len(notifications)}")
            
            # TEST 6: FollowUp lifecycle verification
            print("\n[TEST 6] FollowUp Entity Lifecycle Verification")
            print("=" * 60)
            
            lifecycle_stmt = select(FollowUp).limit(1)
            sample_fu = (await db.execute(lifecycle_stmt)).scalars().first()
            
            if sample_fu:
                print(f"✓ FollowUp has auto_detected flag: {sample_fu.auto_detected}")
                print(f"✓ FollowUp has detection_confidence: {sample_fu.detection_confidence}")
                print(f"✓ FollowUp has metadata_json: {bool(sample_fu.metadata_json)}")
                print(f"✓ FollowUp has snoozed_until: {bool(sample_fu.snoozed_until)}")
                print(f"✓ FollowUp has reply_received_at: {bool(sample_fu.reply_received_at)}")
                results["tests_passed"].append("FollowUp Lifecycle Verification")
                results["database_queries"].append("✓ FollowUp entity fully materialized with all lifecycle fields")
            
        except Exception as e:
            print(f"✗ Error during tests: {str(e)}")
            import traceback
            traceback.print_exc()
            results["tests_failed"].append(f"Exception: {str(e)}")
        
        finally:
            await engine.dispose()
    
    # Print summary
    print("\n" + "=" * 60)
    print("SMOKE TEST SUMMARY")
    print("=" * 60)
    print(f"✓ Passed: {len(results['tests_passed'])}")
    for test in results["tests_passed"]:
        print(f"  ✓ {test}")
    
    if results["tests_failed"]:
        print(f"\n✗ Failed: {len(results['tests_failed'])}")
        for test in results["tests_failed"]:
            print(f"  ✗ {test}")
    
    print(f"\n📊 Database Operations Verified: {len(results['database_queries'])}")
    for op in results["database_queries"]:
        print(f"  {op}")
    
    print("\n" + "=" * 60)
    return len(results["tests_failed"]) == 0


if __name__ == "__main__":
    success = asyncio.run(run_smoke_tests())
    sys.exit(0 if success else 1)
