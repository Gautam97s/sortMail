"""
API Routes - Dashboard
----------------------
Aggregation endpoints for the main dashboard.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_

from pydantic import BaseModel

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.thread import Thread
from models.email import Email
from models.contact import Contact
from sqlalchemy import String
from api.routes.threads import ThreadListItem
from contracts import (
    TaskDTOv1, 
    BriefingDTO,
    DashboardStats,
    DashboardData
)
from models.task import Task, TaskStatus
from core.intelligence.dashboard_briefing import get_dashboard_briefing

router = APIRouter()

@router.get("/stats", response_model=DashboardData)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get aggregated dashboard statistics and briefing.
    """
    from sqlalchemy import exists, cast, Boolean
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    current_date = datetime.now(timezone.utc).date()
    
    # Common filter: Sender is unsubscribed
    sender_is_unsubscribed = exists(
        select(Contact.id).where(
            Contact.user_id == current_user.id,
            Contact.is_unsubscribed == True,
            Email.sender.ilike(func.concat('%', Contact.email_address, '%'))
        ).correlate(Email)
    )

    # 1. Load Recent Threads
    threads_stmt = (
        select(Thread)
        .outerjoin(Email, and_(Email.thread_id == Thread.id, Email.received_at == Thread.last_email_at))
        .where(
            Thread.user_id == current_user.id,
            or_(
                Email.id == None,        # thread has no emails yet
                ~sender_is_unsubscribed  # sender is NOT an unsubscribed contact
            )
        )
        .order_by(desc(Thread.last_email_at))
        .limit(5)
    )
    threads_result = await db.execute(threads_stmt)
    recent_threads_db = threads_result.scalars().all()
    
    recent_threads = [
        ThreadListItem(
            thread_id=t.id,
            external_id=t.external_id or "",
            subject=t.subject or "(No Subject)",
            summary=t.summary or "Pending analysis...",
            intent=t.intent or "PROCESSING",
            urgency_score=t.urgency_score or 0,
            last_updated=t.last_email_at or datetime.now(timezone.utc),
            has_attachments=t.has_attachments or False,
        )
        for t in recent_threads_db
    ]
    
    # 2. Load Priority Tasks
    tasks_stmt = (
        select(Task)
        .where(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.PENDING
        )
        .order_by(desc(Task.priority_score))
        .limit(5)
    )
    tasks_result = await db.execute(tasks_stmt)
    tasks_db = tasks_result.scalars().all()
    
    priority_tasks = [
        TaskDTOv1(
            task_id=t.id,
            thread_id=t.source_thread_id or "",  # Task model uses source_thread_id
            user_id=t.user_id,
            title=t.title,
            description=t.description,
            task_type=t.task_type or "OTHER", # Default to other
            priority=t.priority_level or "CAN_WAIT", # Default to can_wait
            priority_score=t.priority_score,
            priority_explanation=t.metadata_json.get("priority_explanation", ""), 
            effort=t.metadata_json.get("effort") or "QUICK", # Default to quick
            deadline=t.due_date, # Model: due_date
            deadline_source=t.metadata_json.get("deadline_source"), # In metadata
            status=t.status,
            created_at=t.created_at,
            updated_at=t.updated_at
        )
        for t in tasks_db
    ]

    # 3. Stats
    # Unread count
    unread_stmt = select(func.count()).where(
        Thread.user_id == current_user.id,
        Thread.is_unread > 0
    )
    unread_count = (await db.execute(unread_stmt)).scalar() or 0
    
    # Urgent count (excluding unsubscribed)
    urgent_stmt = select(func.count(Thread.id)).outerjoin(Email, and_(Email.thread_id == Thread.id, Email.received_at == Thread.last_email_at)).where(
        Thread.user_id == current_user.id,
        Thread.urgency_score >= 80,
        or_(
            Email.id == None,
            ~sender_is_unsubscribed
        )
    )
    urgent_count = (await db.execute(urgent_stmt)).scalar() or 0
    
    # Tasks Due (Pending and deadline is today or earlier)
    tasks_due_stmt = select(func.count()).where(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.PENDING,
        Task.due_date != None,
        Task.due_date <= current_date
    )
    tasks_due_count = (await db.execute(tasks_due_stmt)).scalar() or 0
    
    # Awaiting Reply (follow_up_needed in intel_json)
    awaiting_reply_stmt = select(func.count(Thread.id)).where(
        Thread.user_id == current_user.id,
        Thread.intel_json['follow_up_needed'].astext == 'true'
    )
    awaiting_reply_count = (await db.execute(awaiting_reply_stmt)).scalar() or 0

    # Daily emails received count (excluding unsubscribed)
    emails_today_stmt = select(func.count(Email.id)).outerjoin(Thread, Email.thread_id == Thread.id).where(
        Thread.user_id == current_user.id,
        Email.received_at >= today_start,
        ~sender_is_unsubscribed
    )
    emails_today_count = (await db.execute(emails_today_stmt)).scalar() or 0
    
    # 4. Synthesize Intelligent Briefing Summary
    summary_sentences = [f"You received {emails_today_count} new emails today."]
    
    if urgent_count > 0:
        summary_sentences.append(f"{urgent_count} threads require immediate attention.")
    
    if recent_threads_db:
        # Get the highest urgency top thread
        top_thread = max(recent_threads_db, key=lambda t: t.urgency_score or 0)
        summary_sentences.append(f"Top priority email: '{top_thread.subject or '(No Subject)'}'.")

    if tasks_due_count > 0:
        summary_sentences.append(f"You have {tasks_due_count} tasks due.")

    if tasks_db:
        # Give an example task
        summary_sentences.append(f"Most urgent task: '{tasks_db[0].title}'.")

    suggested_actions = []
    if urgent_count > 0:
        suggested_actions.append("Review urgent emails")
    if tasks_due_count > 0:
        suggested_actions.append("Complete due tasks")
    if awaiting_reply_count > 0:
        suggested_actions.append("Follow up on waiting threads")

    if not suggested_actions:
        suggested_actions = ["Inbox zero! Enjoy your day."]

    briefing = BriefingDTO(
        summary=" ".join(summary_sentences),
        suggested_actions=suggested_actions[:3]
    )
    
    return DashboardData(
        stats=DashboardStats(
            unread=unread_count,
            unread_delta=f"{emails_today_count} today", 
            urgent=urgent_count,
            tasks_due=tasks_due_count,
            awaiting_reply=awaiting_reply_count
        ),
        briefing=briefing,
        recent_threads=[t.model_dump() for t in recent_threads],
        priority_tasks=[t.model_dump() for t in priority_tasks]
    )


@router.get("/briefing")
async def get_realtime_ai_briefing(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get lightning-fast aggregated view of all high priority/high urgency AI discoveries.
    """
    briefing = await get_dashboard_briefing(user_id=current_user.id, db=db)
    return briefing
