"""
API Routes - Reminders
----------------------
Follow-up reminder endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from contracts import WaitingForDTOv1
from core.storage.database import get_db
from models.user import User
from models.thread import Thread
from models.follow_up import FollowUp, FollowUpStatus
from api.dependencies import get_current_user
from api.routes.bin import create_bin_item

router = APIRouter()


def _parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except ValueError:
        return None


async def _get_follow_up_for_user(db: AsyncSession, user_id: str, waiting_id: str) -> Optional[FollowUp]:
    stmt = select(FollowUp).where(
        FollowUp.user_id == user_id,
        FollowUp.id == waiting_id,
        FollowUp.deleted_at.is_(None),
    )
    follow_up = (await db.execute(stmt)).scalars().first()
    if follow_up:
        return follow_up

    # Backward compatibility: waiting_id can still be thread_id from older clients.
    fallback_stmt = select(FollowUp).where(
        FollowUp.user_id == user_id,
        FollowUp.thread_id == waiting_id,
        FollowUp.deleted_at.is_(None),
    )
    return (await db.execute(fallback_stmt)).scalars().first()

@router.get("", response_model=List[WaitingForDTOv1])
@router.get("/", response_model=List[WaitingForDTOv1], include_in_schema=False)
async def list_reminders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all threads waiting for reply.
    """
    now = datetime.now(timezone.utc)
    stmt = (
        select(FollowUp, Thread)
        .join(Thread, Thread.id == FollowUp.thread_id)
        .where(
            FollowUp.user_id == current_user.id,
            FollowUp.deleted_at.is_(None),
            FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
            Thread.is_trash == False,
            Thread.is_archived == False,
        )
        .order_by(FollowUp.updated_at.desc())
    )
    rows = (await db.execute(stmt)).all()

    reminders = []
    for follow_up, thread in rows:
        if follow_up.snoozed_until and follow_up.snoozed_until > now:
            continue

        metadata = dict(follow_up.metadata_json or {})
        last_sent = _parse_iso_datetime(metadata.get("last_sent_at")) or thread.last_email_at or follow_up.created_at or now
        days_waiting = (now - last_sent).days if now > last_sent else 0

        recipient = metadata.get("recipient") or "Unknown"
        if recipient == "Unknown" and thread.participants:
            user_email = (current_user.email or "").lower()
            for participant in thread.participants:
                if user_email and user_email in (participant or "").lower():
                    continue
                recipient = participant
                break

        reminders.append(WaitingForDTOv1(
            waiting_id=follow_up.id,
            thread_id=thread.id,
            user_id=str(follow_up.user_id),
            last_sent_at=last_sent,
            days_waiting=days_waiting,
            recipient=recipient,
            thread_subject=thread.subject or "(No Subject)",
            thread_summary=thread.summary or "Waiting for reply...",
            reminded=bool(follow_up.reminder_sent),
            last_reminded_at=follow_up.reminder_at,
        ))
    return reminders


@router.post("/{waiting_id}/remind")
async def send_reminder(
    waiting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark that a reminder was sent."""
    follow_up = await _get_follow_up_for_user(db, current_user.id, waiting_id)
    if not follow_up:
        raise HTTPException(status_code=404, detail="Reminder thread not found")

    reminded_at = datetime.now(timezone.utc)
    follow_up.reminder_sent = True
    follow_up.reminder_at = reminded_at
    follow_up.updated_at = reminded_at

    if follow_up.status == FollowUpStatus.WAITING:
        follow_up.status = FollowUpStatus.OVERDUE

    await db.commit()
    return {"waiting_id": follow_up.id, "reminded": True, "reminded_at": reminded_at}


@router.delete("/{waiting_id}")
async def dismiss_reminder(
    waiting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dismiss a waiting-for entry."""
    follow_up = await _get_follow_up_for_user(db, current_user.id, waiting_id)
    if not follow_up:
        raise HTTPException(status_code=404, detail="Reminder thread not found")

    thread_stmt = select(Thread).where(
        Thread.id == follow_up.thread_id,
        Thread.user_id == current_user.id,
    )
    thread = (await db.execute(thread_stmt)).scalars().first()
    if not thread:
        raise HTTPException(status_code=404, detail="Reminder thread not found")

    intel = dict(thread.intel_json or {})
    db.add(
        create_bin_item(
            user_id=current_user.id,
            entity_type="workflow_reminder",
            entity_id=follow_up.id,
            entity_label=thread.subject or "(No Subject)",
            payload_json={
                "thread_id": thread.id,
                "follow_up_needed": True,
                "expected_reply_by": follow_up.expected_reply_by.isoformat() if follow_up.expected_reply_by else intel.get("expected_reply_by"),
                "snoozed_until": follow_up.snoozed_until.isoformat() if follow_up.snoozed_until else None,
            },
        )
    )

    follow_up.status = FollowUpStatus.CANCELLED
    follow_up.deleted_at = datetime.now(timezone.utc)
    follow_up.updated_at = datetime.now(timezone.utc)

    intel["follow_up_needed"] = False
    intel["expected_reply_by"] = None
    intel["workflow_reason"] = "Reminder dismissed by user"
    thread.intel_json = intel
    thread.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return {"waiting_id": follow_up.id, "dismissed": True}
