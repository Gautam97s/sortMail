"""
API Routes - Notifications
--------------------------
In-app notification endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc, and_, exists, func
from pydantic import BaseModel
from datetime import datetime, timezone

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.notification import Notification, NotificationType, NotificationPriority, NotificationPreferences
from models.thread import Thread
from models.email import Email
from models.contact import Contact
from models.task import Task, TaskStatus
from models.follow_up import FollowUp, FollowUpStatus
from models.credits import UserCredits
from models.connected_account import ConnectedAccount, AccountStatus, SyncStatus

router = APIRouter()


DEFAULT_NOTIFICATION_CHANNELS = {
    "email_urgent": True,
    "follow_up_reminder": True,
    "task_due": True,
    "credit_low": True,
    "account_update": True,
}


def _channel_enabled(prefs: Optional[NotificationPreferences], key: str) -> bool:
    if not prefs:
        return True
    channels = prefs.channels or {}
    if key not in channels:
        return True
    return bool(channels.get(key))


async def _synthesize_notifications_for_user(current_user: User, db: AsyncSession) -> int:
    """Create in-app notifications from live data signals (urgent mail, due tasks, etc.)."""
    # Respect in-app preference if present.
    prefs_stmt = select(NotificationPreferences).where(NotificationPreferences.user_id == current_user.id)
    prefs = (await db.execute(prefs_stmt)).scalar_one_or_none()
    if prefs and prefs.in_app_enabled is False:
        return 0

    existing_stmt = select(
        Notification.type,
        Notification.related_entity_type,
        Notification.related_entity_id,
    ).where(
        Notification.user_id == current_user.id,
        Notification.is_dismissed == False,
    )
    existing_rows = (await db.execute(existing_stmt)).all()
    existing_keys = {
        (str(t.value if hasattr(t, "value") else t), et or "", eid or "")
        for t, et, eid in existing_rows
    }

    created = 0
    now = datetime.now(timezone.utc)

    unsubscribed_thread_exists = exists(
        select(Email.id)
        .join(
            Contact,
            and_(
                Contact.user_id == current_user.id,
                Contact.is_unsubscribed == True,
                Email.sender.ilike(func.concat('%', Contact.email_address, '%')),
            ),
        )
        .where(Email.thread_id == Thread.id)
        .correlate(Thread)
    )

    urgent_threads = (
        await db.execute(
            select(Thread)
            .where(
                Thread.user_id == current_user.id,
                Thread.is_unread > 0,
                Thread.urgency_score >= 80,
                Thread.is_archived == False,
                Thread.is_trash == False,
                ~unsubscribed_thread_exists,
            )
            .order_by(desc(Thread.last_email_at))
            .limit(10)
        )
    ).scalars().all()

    for t in urgent_threads:
        if not _channel_enabled(prefs, "email_urgent"):
            break
        key = (NotificationType.EMAIL_URGENT.value, "thread", t.id)
        if key in existing_keys:
            continue
        db.add(
            Notification(
                user_id=current_user.id,
                type=NotificationType.EMAIL_URGENT,
                title="Urgent email needs attention",
                body=(t.subject or "A high-priority thread requires review")[:255],
                action_url=f"/inbox/{t.id}",
                action_text="Open thread",
                related_entity_type="thread",
                related_entity_id=t.id,
                priority=NotificationPriority.HIGH,
                created_at=now,
            )
        )
        created += 1

    due_tasks = (
        await db.execute(
            select(Task)
            .where(
                Task.user_id == current_user.id,
                Task.status == TaskStatus.PENDING.value,
                Task.deleted_at.is_(None),
                Task.due_date.is_not(None),
                Task.due_date <= now.date(),
            )
            .order_by(desc(Task.priority_score))
            .limit(10)
        )
    ).scalars().all()

    for task in due_tasks:
        if not _channel_enabled(prefs, "task_due"):
            break
        key = (NotificationType.TASK_DUE.value, "task", task.id)
        if key in existing_keys:
            continue
        db.add(
            Notification(
                user_id=current_user.id,
                type=NotificationType.TASK_DUE,
                title="Task due",
                body=(task.title or "A task is due")[:255],
                action_url="/tasks?status=PENDING",
                action_text="Open tasks",
                related_entity_type="task",
                related_entity_id=task.id,
                priority=NotificationPriority.NORMAL,
                created_at=now,
            )
        )
        created += 1

    waiting_followups = (
        await db.execute(
            select(FollowUp, Thread)
            .join(Thread, Thread.id == FollowUp.thread_id)
            .where(
                FollowUp.user_id == current_user.id,
                FollowUp.deleted_at.is_(None),
                FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
                Thread.is_archived == False,
                Thread.is_trash == False,
                ~unsubscribed_thread_exists,
                (FollowUp.snoozed_until.is_(None) | (FollowUp.snoozed_until <= now)),
            )
            .order_by(desc(FollowUp.updated_at))
            .limit(10)
        )
    ).all()

    for follow_up, t in waiting_followups:
        if not _channel_enabled(prefs, "follow_up_reminder"):
            break
        key = (NotificationType.FOLLOW_UP_REMINDER.value, "follow_up", follow_up.id)
        if key in existing_keys:
            continue
        db.add(
            Notification(
                user_id=current_user.id,
                type=NotificationType.FOLLOW_UP_REMINDER,
                title="Follow-up recommended",
                body=(t.subject or "A reply is pending")[:255],
                action_url="/followups",
                action_text="Review follow-ups",
                related_entity_type="follow_up",
                related_entity_id=follow_up.id,
                priority=NotificationPriority.NORMAL,
                created_at=now,
            )
        )
        created += 1

    credits = (
        await db.execute(
            select(UserCredits).where(UserCredits.user_id == current_user.id)
        )
    ).scalar_one_or_none()
    if credits and int(credits.credits_balance or 0) <= 10 and _channel_enabled(prefs, "credit_low"):
        key = (NotificationType.CREDIT_LOW.value, "user", current_user.id)
        if key not in existing_keys:
            db.add(
                Notification(
                    user_id=current_user.id,
                    type=NotificationType.CREDIT_LOW,
                    title="Credits running low",
                    body=f"You have {credits.credits_balance} credits remaining.",
                    action_url="/credits",
                    action_text="Manage credits",
                    related_entity_type="user",
                    related_entity_id=current_user.id,
                    priority=NotificationPriority.HIGH,
                    created_at=now,
                )
            )
            created += 1

    if _channel_enabled(prefs, "account_update"):
        account_issues = (
            await db.execute(
                select(ConnectedAccount)
                .where(
                    ConnectedAccount.user_id == current_user.id,
                    ConnectedAccount.deleted_at.is_(None),
                    (
                        ConnectedAccount.status.in_([
                            AccountStatus.ERROR,
                            AccountStatus.EXPIRED,
                            AccountStatus.REVOKED,
                            AccountStatus.DISCONNECTED,
                        ])
                        | ConnectedAccount.sync_status.in_([SyncStatus.FAILED, SyncStatus.REVOKED])
                        | ConnectedAccount.sync_error.is_not(None)
                    ),
                )
                .order_by(desc(ConnectedAccount.updated_at))
                .limit(5)
            )
        ).scalars().all()

        for account in account_issues:
            key = (NotificationType.ACCOUNT_UPDATE.value, "connected_account", account.id)
            if key in existing_keys:
                continue
            provider = str(account.provider.value if hasattr(account.provider, "value") else account.provider)
            email = account.provider_email or "your account"
            db.add(
                Notification(
                    user_id=current_user.id,
                    type=NotificationType.ACCOUNT_UPDATE,
                    title=f"{provider} account needs attention",
                    body=f"{email} needs reconnection or sync troubleshooting.",
                    action_url="/settings/accounts",
                    action_text="Manage account",
                    related_entity_type="connected_account",
                    related_entity_id=account.id,
                    priority=NotificationPriority.HIGH,
                    created_at=now,
                )
            )
            created += 1

    if created > 0:
        await db.commit()
        try:
            from api.routes.events import publish_event
            await publish_event(str(current_user.id), {"type": "notification_new", "count": created})
        except Exception:
            pass
    return created


class NotificationOut(BaseModel):
    id: str
    type: str
    title: str
    body: Optional[str]
    action_url: Optional[str]
    is_read: bool
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationOut])
async def list_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List recent notifications for the current user."""
    await _synthesize_notifications_for_user(current_user, db)
    stmt = (
        select(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_dismissed == False,
        )
        .order_by(desc(Notification.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    return notifications


@router.get("/unread-count")
async def unread_notification_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _synthesize_notifications_for_user(current_user, db)
    count = (
        await db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == current_user.id,
                Notification.is_dismissed == False,
                Notification.is_read == False,
            )
        )
    ).scalar() or 0
    return {"unread": int(count)}


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a notification as read."""
    stmt = (
        update(Notification)
        .where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.execute(stmt)
    await db.commit()
    try:
        from api.routes.events import publish_event
        await publish_event(str(current_user.id), {"type": "notification_updated", "id": notification_id})
    except Exception:
        pass
    return {"success": True}


@router.post("/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read."""
    stmt = (
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.execute(stmt)
    await db.commit()
    try:
        from api.routes.events import publish_event
        await publish_event(str(current_user.id), {"type": "notification_updated", "all": True})
    except Exception:
        pass
    return {"success": True}


@router.delete("/{notification_id}")
async def dismiss_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dismiss (soft-delete) a notification."""
    stmt = (
        update(Notification)
        .where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .values(is_dismissed=True, dismissed_at=datetime.now(timezone.utc))
    )
    await db.execute(stmt)
    await db.commit()
    try:
        from api.routes.events import publish_event
        await publish_event(str(current_user.id), {"type": "notification_updated", "id": notification_id, "dismissed": True})
    except Exception:
        pass
    return {"success": True}


# ─── Notification Preferences ──────────────────────────────────────────────────

import uuid as _uuid


class NotificationPreferencesOut(BaseModel):
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool
    channels: dict
    quiet_hours_start: Optional[str]
    quiet_hours_end: Optional[str]
    quiet_hours_timezone: Optional[str]

    class Config:
        from_attributes = True


class UpdateNotificationPreferencesRequest(BaseModel):
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    channels: Optional[dict] = None
    quiet_hours_start: Optional[str] = None   # "22:00"
    quiet_hours_end: Optional[str] = None     # "08:00"
    quiet_hours_timezone: Optional[str] = None


@router.get("/preferences", response_model=NotificationPreferencesOut)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's notification preferences."""
    stmt = select(NotificationPreferences).where(
        NotificationPreferences.user_id == current_user.id
    )
    result = await db.execute(stmt)
    prefs = result.scalar_one_or_none()

    if not prefs:
        # Create defaults
        prefs = NotificationPreferences(
            id=str(_uuid.uuid4()),
            user_id=current_user.id,
            channels=DEFAULT_NOTIFICATION_CHANNELS,
        )
        db.add(prefs)
        try:
            await db.commit()
        except Exception:
            # Handle parallel TOCTOU initialization race
            await db.rollback()
            result = await db.execute(stmt)
            prefs = result.scalar_one_or_none()
            if not prefs: raise

    return NotificationPreferencesOut(
        email_enabled=prefs.email_enabled,
        push_enabled=prefs.push_enabled,
        in_app_enabled=prefs.in_app_enabled,
        channels={**DEFAULT_NOTIFICATION_CHANNELS, **(prefs.channels or {})},
        quiet_hours_start=prefs.quiet_hours_start.strftime("%H:%M") if prefs.quiet_hours_start else None,
        quiet_hours_end=prefs.quiet_hours_end.strftime("%H:%M") if prefs.quiet_hours_end else None,
        quiet_hours_timezone=prefs.quiet_hours_timezone,
    )


@router.patch("/preferences")
async def update_notification_preferences(
    body: UpdateNotificationPreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's notification preferences."""
    from datetime import time as dtime
    stmt = select(NotificationPreferences).where(
        NotificationPreferences.user_id == current_user.id
    )
    result = await db.execute(stmt)
    prefs = result.scalar_one_or_none()

    if not prefs:
        prefs = NotificationPreferences(
            id=str(_uuid.uuid4()),
            user_id=current_user.id,
            channels=DEFAULT_NOTIFICATION_CHANNELS,
        )
        db.add(prefs)

    if body.email_enabled is not None:
        prefs.email_enabled = body.email_enabled
    if body.push_enabled is not None:
        prefs.push_enabled = body.push_enabled
    if body.in_app_enabled is not None:
        prefs.in_app_enabled = body.in_app_enabled
    if body.channels is not None:
        prefs.channels = {**DEFAULT_NOTIFICATION_CHANNELS, **body.channels}
    try:
        if body.quiet_hours_start is not None:
            h, m = map(int, body.quiet_hours_start.split(":"))
            prefs.quiet_hours_start = dtime(h, m)
        if body.quiet_hours_end is not None:
            h, m = map(int, body.quiet_hours_end.split(":"))
            prefs.quiet_hours_end = dtime(h, m)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Expected HH:MM")

    if body.quiet_hours_timezone is not None:
        prefs.quiet_hours_timezone = body.quiet_hours_timezone

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update preferences")
    return {"updated": True}
