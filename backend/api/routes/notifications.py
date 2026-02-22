"""
API Routes - Notifications
--------------------------
In-app notification endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc
from pydantic import BaseModel
from datetime import datetime

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.notification import Notification

router = APIRouter()


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
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List recent notifications for the current user."""
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
        .values(is_read=True, read_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
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
        .values(is_read=True, read_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
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
        .values(is_dismissed=True, dismissed_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
    return {"success": True}
