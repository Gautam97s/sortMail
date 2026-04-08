from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from pydantic import BaseModel

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.task import Task, TaskStatus as DBTaskStatus, TaskType as DBTaskType
from contracts import TaskDTOv1, PriorityLevel, TaskStatus

router = APIRouter()


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    thread_id: Optional[str] = None
    source_email_id: Optional[str] = None
    source_type: Optional[str] = None
    task_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None


def _to_enum_value(value) -> str:
    if value is None:
        return ""
    return value.value if hasattr(value, "value") else str(value)


def _map_priority_to_contract(level: Optional[str]) -> str:
    normalized = (level or "").strip().upper()
    if normalized in {"DO_NOW", "URGENT", "CRITICAL"}:
        return PriorityLevel.DO_NOW.value
    if normalized in {"DO_TODAY", "HIGH"}:
        return PriorityLevel.DO_TODAY.value
    return PriorityLevel.CAN_WAIT.value


def _map_priority_to_db(level: Optional[str]) -> str:
    normalized = (level or "").strip().upper()
    if normalized in {"DO_NOW", "URGENT", "CRITICAL"}:
        return "DO_NOW"
    if normalized in {"DO_TODAY", "HIGH"}:
        return "DO_TODAY"
    return "CAN_WAIT"


def _map_status(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().upper()
    allowed = {s.value for s in DBTaskStatus}
    return normalized if normalized in allowed else None


def _map_task_type(value: Optional[str]) -> str:
    normalized = (value or "REPLY").strip().upper()
    allowed = {t.value for t in DBTaskType}
    return normalized if normalized in allowed else DBTaskType.REPLY.value


def _to_task_dto(t: Task) -> TaskDTOv1:
    task_type_value = _to_enum_value(t.task_type).upper() or DBTaskType.REPLY.value
    status_value = _to_enum_value(t.status).upper() or DBTaskStatus.PENDING.value
    return TaskDTOv1(
        task_id=t.id,
        thread_id=t.source_thread_id,
        source_email_id=t.source_email_id,
        source_type=t.source_type,
        user_id=t.user_id,
        title=t.title,
        description=t.description,
        task_type=task_type_value,
        priority=_map_priority_to_contract(t.priority_level),
        priority_score=t.priority_score or 0,
        priority_explanation=None,
        effort=None,
        deadline=t.due_time,
        deadline_source=None,
        status=status_value,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )

@router.get("/", response_model=List[TaskDTOv1])
async def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    q: Optional[str] = None,
    thread_id: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tasks for current user, sorted by priority_score descending."""
    stmt = select(Task).where(Task.user_id == current_user.id)

    mapped_status = _map_status(status)
    if status and not mapped_status:
        raise HTTPException(status_code=400, detail="Invalid status filter")
    if mapped_status:
        stmt = stmt.where(Task.status == mapped_status)

    if priority:
        stmt = stmt.where(Task.priority_level == _map_priority_to_db(priority))

    if thread_id:
        stmt = stmt.where(Task.source_thread_id == thread_id)

    if q:
        term = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Task.title.ilike(term),
                Task.description.ilike(term),
            )
        )

    stmt = stmt.order_by(desc(Task.priority_score)).limit(limit)

    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return [_to_task_dto(t) for t in tasks]


@router.post("/", response_model=TaskDTOv1)
async def create_task(
    payload: TaskCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a user task that can be managed from Kanban/workflow."""
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    task = Task(
        user_id=current_user.id,
        source_thread_id=payload.thread_id,
        source_email_id=payload.source_email_id,
        title=title,
        description=(payload.description or None),
        task_type=_map_task_type(payload.task_type),
        status=_map_status(payload.status) or DBTaskStatus.PENDING.value,
        priority_level=_map_priority_to_db(payload.priority),
        due_time=payload.deadline,
        source_type=(payload.source_type or "USER_CREATED"),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _to_task_dto(task)


# â”€â”€â”€ Calendar Suggestions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

from models.calendar_suggestion import CalendarSuggestion, CalendarSuggestionStatus
from contracts.workflow import CalendarSuggestionV1


@router.get("/calendar-suggestions", response_model=list[CalendarSuggestionV1])
async def list_calendar_suggestions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List pending AI-detected calendar suggestions."""
    try:
        stmt = (
            select(CalendarSuggestion)
            .where(
                CalendarSuggestion.user_id == current_user.id,
                CalendarSuggestion.status == CalendarSuggestionStatus.SUGGESTED,
            )
            .order_by(desc(CalendarSuggestion.suggested_time))
        )
        result = await db.execute(stmt)
        suggestions = result.scalars().all()
        return [
            CalendarSuggestionV1(
                suggestion_id=s.id,
                thread_id=s.thread_id,
                title=s.title,
                suggested_time=s.suggested_time,
                duration_minutes=s.duration_minutes or 60,
                location=s.location,
                participants=s.participants or [],
                confidence=s.confidence or 0.8,
            )
            for s in suggestions
        ]
    except Exception:
        # If CalendarSuggestion table doesn't exist yet, return empty
        return []


@router.post("/calendar-suggestions/{suggestion_id}/accept")
async def accept_calendar_suggestion(
    suggestion_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a calendar suggestion as accepted."""
    try:
        stmt = select(CalendarSuggestion).where(
            CalendarSuggestion.id == suggestion_id,
            CalendarSuggestion.user_id == current_user.id,
        )
        result = await db.execute(stmt)
        suggestion = result.scalars().first()
        if suggestion:
            suggestion.status = CalendarSuggestionStatus.ACCEPTED
            await db.commit()
    except Exception:
        pass
    return {"accepted": True}


@router.delete("/calendar-suggestions/{suggestion_id}")
async def dismiss_calendar_suggestion(
    suggestion_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dismiss a calendar suggestion."""
    try:
        stmt = select(CalendarSuggestion).where(
            CalendarSuggestion.id == suggestion_id,
            CalendarSuggestion.user_id == current_user.id,
        )
        result = await db.execute(stmt)
        suggestion = result.scalars().first()
        if suggestion:
            suggestion.status = CalendarSuggestionStatus.DISMISSED
            await db.commit()
    except Exception:
        pass
    return {"dismissed": True}


@router.get("/{task_id}", response_model=TaskDTOv1)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific task by ID."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return _to_task_dto(task)


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update editable task fields used by Kanban and workflow automation."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        task.title = title

    if payload.description is not None:
        task.description = payload.description

    if payload.status is not None:
        mapped_status = _map_status(payload.status)
        if not mapped_status:
            raise HTTPException(status_code=400, detail="Invalid status")
        task.status = mapped_status
        if mapped_status == DBTaskStatus.COMPLETED.value:
            task.completed_at = datetime.now(timezone.utc)

    if payload.priority is not None:
        task.priority_level = _map_priority_to_db(payload.priority)

    if payload.task_type is not None:
        task.task_type = _map_task_type(payload.task_type)

    if payload.deadline is not None:
        task.due_time = payload.deadline

    task.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return _to_task_dto(task)


@router.delete("/{task_id}")
async def dismiss_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dismiss/cancel a task."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = DBTaskStatus.DISMISSED
    task.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"task_id": task_id, "dismissed": True}



# Calendar suggestions routes moved up to prevent shadowing by /{task_id}
