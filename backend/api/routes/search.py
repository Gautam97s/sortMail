"""
Universal Search Route
----------------------
GET /api/search?q=<query>
Returns results across threads, contacts, and tasks for the current user.
"""

from typing import List, Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from pydantic import BaseModel
from datetime import datetime

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.thread import Thread
from models.contact import Contact
from models.task import Task

router = APIRouter()


# ─── Response Models ─────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    type: Literal["thread", "contact", "task"]
    id: str
    title: str
    subtitle: str
    intent: Optional[str] = None
    href: str
    updated_at: Optional[datetime] = None


class SearchResponse(BaseModel):
    q: str
    total: int
    results: List[SearchResult]


# ─── Endpoint ────────────────────────────────────────────────────────────────

@router.get("", response_model=SearchResponse)
async def universal_search(
    q: str = Query(..., min_length=1, description="Search query"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Unified search across threads, contacts, and tasks.
    All results are strictly scoped to the current user.
    """
    q_like = f"%{q}%"
    uid = current_user.id
    results: List[SearchResult] = []

    # ── Threads (subject + summary) ──────────────────────────────────────────
    thread_stmt = (
        select(Thread)
        .where(
            Thread.user_id == uid,
            or_(
                Thread.subject.ilike(q_like),
                Thread.summary.ilike(q_like),
            )
        )
        .order_by(desc(Thread.last_email_at))
        .limit(20)
    )
    threads = (await db.execute(thread_stmt)).scalars().all()
    for t in threads:
        results.append(SearchResult(
            type="thread",
            id=t.id,
            title=t.subject or "(No Subject)",
            subtitle=t.summary or "No preview available",
            intent=t.intent,
            href=f"/inbox/{t.id}",
            updated_at=t.last_email_at,
        ))

    # ── Contacts (name + email) ───────────────────────────────────────────────
    contact_stmt = (
        select(Contact)
        .where(
            Contact.user_id == uid,
            or_(
                Contact.name.ilike(q_like),
                Contact.email_address.ilike(q_like),
                Contact.company.ilike(q_like),
            )
        )
        .order_by(desc(Contact.last_interaction_at))
        .limit(10)
    )
    contacts = (await db.execute(contact_stmt)).scalars().all()
    for c in contacts:
        results.append(SearchResult(
            type="contact",
            id=c.id,
            title=c.name or c.email_address,
            subtitle=c.email_address if c.name else (c.company or "Contact"),
            href=f"/contacts/{c.email_address}",
            updated_at=c.last_interaction_at or c.created_at,
        ))

    # ── Tasks (title + description) ───────────────────────────────────────────
    task_stmt = (
        select(Task)
        .where(
            Task.user_id == uid,
            or_(
                Task.title.ilike(q_like),
                Task.description.ilike(q_like),
            )
        )
        .order_by(desc(Task.priority_score))
        .limit(10)
    )
    tasks = (await db.execute(task_stmt)).scalars().all()
    for t in tasks:
        results.append(SearchResult(
            type="task",
            id=t.id,
            title=t.title or "Untitled Task",
            subtitle=t.description or t.task_type or "Task",
            href=f"/tasks",
            updated_at=t.updated_at or t.created_at,
        ))

    # Sort all results by recency for a unified timeline
    results.sort(key=lambda r: r.updated_at or datetime.min, reverse=True)

    return SearchResponse(q=q, total=len(results), results=results)
