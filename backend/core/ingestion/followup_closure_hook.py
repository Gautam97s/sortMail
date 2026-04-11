"""
Follow-up Closure Hook
----------------------
Detects inbound replies and closes matching FollowUp records.

When a new inbound email arrives in a thread, check if there are any open
FollowUp records waiting for reply. If the sender is NOT the current user,
mark the FollowUp as REPLIED and record the reply timestamp.

This ensures complete follow-up lifecycle automation: detection → reminder → close.
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from models.thread import Thread
from models.email import Email
from models.follow_up import FollowUp, FollowUpStatus
from models.user import User

logger = logging.getLogger(__name__)


async def detect_and_close_follow_ups(db: AsyncSession, thread_id: str, user_id: str):
    """
    Detect if an inbound reply has arrived for a thread with open follow-ups.
    
    Strategy:
    1. Get the most recent email in the thread
    2. If it's FROM someone other than the user (inbound reply), close follow-ups
    3. Set status=REPLIED, reply_received_at=email timestamp
    4. Update thread intel_json for backward compatibility
    
    Args:
        db: AsyncSession for database operations
        thread_id: Thread ID to check
        user_id: User ID (to identify outbound vs inbound)
    """
    try:
        # Get user object for email matching
        user_stmt = select(User).where(User.id == user_id)
        user = (await db.execute(user_stmt)).scalars().first()
        
        if not user:
            logger.warning(f"User {user_id} not found for reply detection")
            return
        
        user_email = (user.email or "").lower()
        
        # Step 1: Get most recent email in thread
        email_stmt = (
            select(Email)
            .where(Email.thread_id == thread_id)
            .order_by(Email.received_at.desc(), Email.sent_at.desc())
            .limit(1)
        )
        latest_email = (await db.execute(email_stmt)).scalars().first()
        
        if not latest_email:
            return  # No emails yet
        
        # Step 2: Check if it's FROM the user (outbound) or TO the user (inbound/reply)
        sender_email = (latest_email.sender or "").lower()
        is_from_user = latest_email.is_from_user == True or user_email in sender_email
        
        if is_from_user:
            # This is an outbound email, not a reply
            return
        
        # Step 3: Find all open follow-ups for this thread
        open_followups_stmt = (
            select(FollowUp)
            .where(
                FollowUp.thread_id == thread_id,
                FollowUp.user_id == user_id,
                FollowUp.deleted_at.is_(None),
                FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE, FollowUpStatus.SNOOZED]),
            )
        )
        open_followups = (await db.execute(open_followups_stmt)).scalars().all()
        
        if not open_followups:
            return  # No open follow-ups to close
        
        logger.info(f"🔄 Detected reply in thread {thread_id}. Closing {len(open_followups)} follow-ups.")
        
        # Step 4: Close all open follow-ups
        now = datetime.now(timezone.utc)
        email_timestamp = latest_email.received_at or latest_email.sent_at or now
        
        for follow_up in open_followups:
            follow_up.status = FollowUpStatus.REPLIED
            follow_up.reply_received_at = email_timestamp
            follow_up.updated_at = now
            
            logger.info(f"  ✓ FollowUp {follow_up.id}: WAITING → REPLIED (reply from {sender_email})")
        
        # Step 5: Update thread intel_json for backward compatibility
        thread_stmt = select(Thread).where(Thread.id == thread_id)
        thread = (await db.execute(thread_stmt)).scalars().first()
        
        if thread:
            intel = thread.intel_json or {}
            intel['follow_up_needed'] = False  # Clear the flag
            intel['follow_up_closed_at'] = now.isoformat()
            intel['follow_up_closed_by_reply'] = True
            intel['reply_sender'] = sender_email
            thread.intel_json = intel
            thread.updated_at = now
        
        # Commit changes
        await db.commit()
        logger.info(f"✓ Committed reply-detected closure for thread {thread_id}")
        
    except Exception as e:
        logger.error(f"Error in reply detection for thread {thread_id}: {str(e)}", exc_info=True)
        # Don't raise; reply detection is non-critical


async def detect_and_close_follow_ups_batch(db: AsyncSession, thread_ids: list, user_id: str):
    """
    Process reply detection for multiple threads (bulk operation).
    
    Args:
        db: AsyncSession for database operations
        thread_ids: List of thread IDs to process
        user_id: User ID
    """
    for thread_id in thread_ids:
        await detect_and_close_follow_ups(db, thread_id, user_id)
