"""
API Routes - Universal Bin
--------------------------
Soft-deleted records with 30-day restore window.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_current_user
from core.storage.database import get_db
from models.user import User
from models.recycle_bin import RecycleBinItem
from models.thread import Thread
from models.task import Task
from models.draft import Draft
from models.email import Email
from models.attachment import Attachment
from models.tag import thread_tags

router = APIRouter()

RETENTION_DAYS = 30


class BinItemOut(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    entity_label: Optional[str] = None
    deleted_at: datetime
    restore_until: datetime


@router.get("", response_model=List[BinItemOut])
@router.get("/", response_model=List[BinItemOut], include_in_schema=False)
async def list_bin_items(
    limit: int = Query(default=100, ge=1, le=300),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    stmt = (
        select(RecycleBinItem)
        .where(
            RecycleBinItem.user_id == current_user.id,
            RecycleBinItem.restored_at.is_(None),
            RecycleBinItem.purged_at.is_(None),
            RecycleBinItem.restore_until > now,
        )
        .order_by(RecycleBinItem.deleted_at.desc())
        .limit(limit)
    )
    items = (await db.execute(stmt)).scalars().all()
    return [
        BinItemOut(
            id=item.id,
            entity_type=item.entity_type,
            entity_id=item.entity_id,
            entity_label=item.entity_label,
            deleted_at=item.deleted_at,
            restore_until=item.restore_until,
        )
        for item in items
    ]


@router.post("/{bin_item_id}/restore")
async def restore_bin_item(
    bin_item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    stmt = select(RecycleBinItem).where(
        RecycleBinItem.id == bin_item_id,
        RecycleBinItem.user_id == current_user.id,
        RecycleBinItem.restored_at.is_(None),
        RecycleBinItem.purged_at.is_(None),
    )
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Bin item not found")

    if item.restore_until <= now:
        raise HTTPException(status_code=410, detail="Restore window expired")

    if item.entity_type == "thread":
        thread = (await db.execute(select(Thread).where(Thread.id == item.entity_id, Thread.user_id == current_user.id))).scalars().first()
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found for restore")
        labels = [label for label in (thread.labels or []) if label != "TRASH"]
        if "INBOX" not in labels:
            labels.append("INBOX")
        thread.labels = labels
        thread.is_trash = False
        thread.is_archived = False

    elif item.entity_type == "task":
        task = (await db.execute(select(Task).where(Task.id == item.entity_id, Task.user_id == current_user.id))).scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found for restore")
        task.deleted_at = None

    elif item.entity_type == "draft":
        draft = (await db.execute(select(Draft).where(Draft.id == item.entity_id, Draft.user_id == current_user.id))).scalars().first()
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found for restore")
        draft.deleted_at = None

    elif item.entity_type == "workflow_reminder":
        thread = (await db.execute(select(Thread).where(Thread.id == item.entity_id, Thread.user_id == current_user.id))).scalars().first()
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found for restore")
        intel = dict(thread.intel_json or {})
        intel["follow_up_needed"] = True
        expected_reply_by = (item.payload_json or {}).get("expected_reply_by")
        if expected_reply_by:
            intel["expected_reply_by"] = expected_reply_by
        thread.intel_json = intel

    else:
        raise HTTPException(status_code=400, detail="Unsupported bin entity")

    item.restored_at = now
    await db.commit()
    return {"restored": True, "bin_item_id": bin_item_id}


@router.delete("/{bin_item_id}")
async def purge_bin_item(
    bin_item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(RecycleBinItem).where(
        RecycleBinItem.id == bin_item_id,
        RecycleBinItem.user_id == current_user.id,
        RecycleBinItem.restored_at.is_(None),
        RecycleBinItem.purged_at.is_(None),
    )
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Bin item not found")

    if item.entity_type == "thread":
        email_ids = (
            await db.execute(
                select(Email.id).where(
                    Email.thread_id == item.entity_id,
                    Email.user_id == current_user.id,
                )
            )
        ).scalars().all()

        if email_ids:
            await db.execute(
                delete(Attachment).where(
                    Attachment.user_id == current_user.id,
                    Attachment.email_id.in_(list(email_ids)),
                )
            )

        await db.execute(delete(Draft).where(Draft.thread_id == item.entity_id, Draft.user_id == current_user.id))
        await db.execute(delete(Task).where(Task.source_thread_id == item.entity_id, Task.user_id == current_user.id))
        await db.execute(delete(Email).where(Email.thread_id == item.entity_id, Email.user_id == current_user.id))
        await db.execute(delete(thread_tags).where(thread_tags.c.thread_id == item.entity_id))
        await db.execute(delete(Thread).where(Thread.id == item.entity_id, Thread.user_id == current_user.id))

    elif item.entity_type == "task":
        await db.execute(delete(Task).where(Task.id == item.entity_id, Task.user_id == current_user.id))

    elif item.entity_type == "draft":
        await db.execute(delete(Draft).where(Draft.id == item.entity_id, Draft.user_id == current_user.id))

    elif item.entity_type == "workflow_reminder":
        # Reminder is logical state on thread intel; nothing else to purge.
        pass

    item.purged_at = datetime.now(timezone.utc)
    await db.commit()
    return {"purged": True, "bin_item_id": bin_item_id}


@router.post("/purge-expired")
async def purge_expired_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    stmt = select(RecycleBinItem).where(
        RecycleBinItem.user_id == current_user.id,
        RecycleBinItem.restored_at.is_(None),
        RecycleBinItem.purged_at.is_(None),
        RecycleBinItem.restore_until <= now,
    )
    items = (await db.execute(stmt)).scalars().all()

    purged = 0
    for item in items:
        item.purged_at = now
        purged += 1

    await db.commit()
    return {"purged_expired": purged}


def create_bin_item(
    user_id: str,
    entity_type: str,
    entity_id: str,
    entity_label: Optional[str] = None,
    payload_json: Optional[dict] = None,
) -> RecycleBinItem:
    now = datetime.now(timezone.utc)
    return RecycleBinItem(
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_label=entity_label,
        payload_json=payload_json or {},
        deleted_at=now,
        restore_until=now + timedelta(days=RETENTION_DAYS),
    )
