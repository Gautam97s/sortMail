"""
API Routes - Reminders
----------------------
Follow-up reminder endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from contracts import WaitingForDTOv1
from core.storage.database import get_db
from models.user import User
from models.thread import Thread
from api.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[WaitingForDTOv1])
@router.get("/", response_model=List[WaitingForDTOv1], include_in_schema=False)
async def list_reminders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all threads waiting for reply.
    """
    stmt = select(Thread).where(
        Thread.user_id == current_user.id,
        Thread.intel_json['follow_up_needed'].astext == 'true'
    ).order_by(Thread.last_email_at.desc().nullslast())
    
    result = await db.execute(stmt)
    threads = result.scalars().all()
    
    reminders = []
    now = datetime.now(timezone.utc)
    for t in threads:
        last_sent = t.last_email_at or now
        days_waiting = (now - last_sent).days if now > last_sent else 0
        
        # Get primary recipient (first participant that isn't the current user)
        recipient = "Unknown"
        if t.participants:
            for p in t.participants:
                if current_user.email not in p:
                    recipient = p
                    break
                    
        reminders.append(WaitingForDTOv1(
            waiting_id=t.id,
            thread_id=t.id,
            user_id=str(t.user_id),
            last_sent_at=last_sent,
            days_waiting=days_waiting,
            recipient=recipient,
            thread_subject=t.subject or "(No Subject)",
            thread_summary=t.summary or "Waiting for reply...",
            reminded=False
        ))
    return reminders


@router.post("/{waiting_id}/remind")
async def send_reminder(
    waiting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark that a reminder was sent."""
    # TODO: Implement actual reminder email sending
    return {"waiting_id": waiting_id, "reminded": True, "reminded_at": datetime.now(timezone.utc)}


@router.delete("/{waiting_id}")
async def dismiss_reminder(
    waiting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dismiss a waiting-for entry."""
    # Since we use intel_json to drive this, dismissing might mean updating the thread to follow_up_needed: false
    # For now, just return success
    return {"waiting_id": waiting_id, "dismissed": True}
