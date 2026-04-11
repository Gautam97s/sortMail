"""
API Routes - Dashboard
----------------------
Aggregation endpoints for the main dashboard.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_, exists

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
from models.follow_up import FollowUp, FollowUpStatus
from core.intelligence.dashboard_briefing import get_dashboard_briefing

router = APIRouter()


def _is_promotional_thread(thread: Thread) -> bool:
    intel = thread.intel_json or {}
    intent = (thread.intent or "").upper()
    if intel.get("is_promotional") is True:
        return True
    if intent in {"NEWSLETTER", "SOCIAL"}:
        return True
    summary = (thread.summary or "").lower()
    subject = (thread.subject or "").lower()
    promo_markers = (
        "newsletter",
        "unsubscribe",
        "promotion",
        "promotional",
        "marketing",
        "deal",
        "sale",
        "digest",
    )
    return any(marker in summary or marker in subject for marker in promo_markers)


def _score_thread_for_summary(thread: Thread) -> int:
    intent = (thread.intent or "").upper()
    score = int(thread.urgency_score or 0)
    if intent == "ACTION_REQUIRED":
        score += 18
    elif intent == "URGENT":
        score += 25
    elif intent == "QUESTION":
        score += 10
    elif intent == "FYI":
        score -= 8
    elif intent in {"NEWSLETTER", "SOCIAL"}:
        score -= 50
    if thread.is_unread:
        score += 5
    if thread.has_attachments:
        score += 3
    return score


def _describe_task_deadline(task: Task) -> str:
    if not task.due_date:
        return ""

    today = datetime.now(timezone.utc).date()
    due_date = task.due_date.date() if hasattr(task.due_date, "date") else task.due_date
    days_diff = (due_date - today).days

    if days_diff < 0:
        return f"overdue by {abs(days_diff)} day{'s' if abs(days_diff) != 1 else ''}"
    if days_diff == 0:
        return "due today"
    if days_diff == 1:
        return "due tomorrow"
    return f"due in {days_diff} days"

@router.get("/stats", response_model=DashboardData)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get aggregated dashboard statistics and briefing.
    """
    from sqlalchemy import cast, Boolean
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    current_date = datetime.now(timezone.utc).date()
    
    # Common filter: thread contains messages from unsubscribed contacts
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

    # 1. Load Recent Threads
    threads_stmt = (
        select(Thread)
        .where(
            Thread.user_id == current_user.id,
            ~unsubscribed_thread_exists,
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
        Thread.is_unread > 0,
        Thread.is_archived == False,
        Thread.is_trash == False,
        ~unsubscribed_thread_exists,
    )
    unread_count = (await db.execute(unread_stmt)).scalar() or 0
    
    # Urgent count (excluding unsubscribed)
    urgent_stmt = select(func.count(Thread.id)).where(
        Thread.user_id == current_user.id,
        Thread.urgency_score >= 80,
        Thread.is_archived == False,
        Thread.is_trash == False,
        ~unsubscribed_thread_exists,
    )
    urgent_count = (await db.execute(urgent_stmt)).scalar() or 0
    
    # Tasks Due (Pending and deadline is today or earlier)
    tasks_due_stmt = select(func.count()).where(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.PENDING,
        Task.deleted_at == None,
        Task.due_date != None,
        Task.due_date <= current_date
    )
    tasks_due_count = (await db.execute(tasks_due_stmt)).scalar() or 0
    
    # Awaiting Reply (follow_up_needed in intel_json)
    awaiting_reply_stmt = select(func.count(FollowUp.id)).join(
        Thread, Thread.id == FollowUp.thread_id
    ).where(
        FollowUp.user_id == current_user.id,
        FollowUp.deleted_at.is_(None),
        FollowUp.status.in_([FollowUpStatus.WAITING, FollowUpStatus.OVERDUE]),
        Thread.is_archived == False,
        Thread.is_trash == False,
        ~unsubscribed_thread_exists,
    )
    awaiting_reply_count = (await db.execute(awaiting_reply_stmt)).scalar() or 0

    # Daily emails received count (excluding unsubscribed)
    emails_today_stmt = select(func.count(Email.id)).join(Thread, Email.thread_id == Thread.id).where(
        Thread.user_id == current_user.id,
        Email.received_at >= today_start,
        Thread.is_archived == False,
        Thread.is_trash == False,
        ~unsubscribed_thread_exists,
    )
    emails_today_count = (await db.execute(emails_today_stmt)).scalar() or 0
    
    # 4. Synthesize Intelligent Briefing Summary from existing dashboard data only.
    summary_sentences = [f"You received {emails_today_count} new emails today."]

    if urgent_count > 0:
        summary_sentences.append(f"{urgent_count} thread{'s' if urgent_count != 1 else ''} need immediate attention.")

    actionable_threads = [thread for thread in recent_threads_db if not _is_promotional_thread(thread)]
    if actionable_threads:
        top_thread = max(actionable_threads, key=_score_thread_for_summary)
        top_thread_subject = top_thread.subject or "(No Subject)"
        top_thread_intent = (top_thread.intent or "").replace("_", " ").lower()
        if top_thread_intent and top_thread_intent != "fyi":
            summary_sentences.append(f"Top thread: '{top_thread_subject}' ({top_thread_intent}).")
        else:
            summary_sentences.append(f"Top thread: '{top_thread_subject}'.")
    elif recent_threads_db:
        top_thread = max(recent_threads_db, key=_score_thread_for_summary)
        summary_sentences.append(f"Top thread: '{top_thread.subject or '(No Subject)'}'.")

    if tasks_due_count > 0:
        summary_sentences.append(f"You have {tasks_due_count} task{'s' if tasks_due_count != 1 else ''} due.")

    if tasks_db:
        top_task = tasks_db[0]
        deadline_note = _describe_task_deadline(top_task)
        if deadline_note:
            summary_sentences.append(f"Top task: '{top_task.title}' is {deadline_note}.")
        else:
            summary_sentences.append(f"Top task: '{top_task.title}'.")

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
