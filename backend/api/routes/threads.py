"""
API Routes - Threads
--------------------
Email thread endpoints.
"""

import re
from urllib.parse import quote
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timezone

from contracts import ThreadIntelV1
from contracts.mocks import create_mock_thread_intel


from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.config import settings

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.thread import Thread
from models.email import Email
from models.contact import Contact
from sqlalchemy import and_, or_, func, exists
from core.credits.credit_service import CreditService, InsufficientCreditsError, RateLimitExceededError

router = APIRouter(redirect_slashes=False)


class ThreadListItem(BaseModel):
    """Lightweight thread for list view."""
    thread_id: str
    external_id: str
    subject: str
    summary: str
    intent: str
    urgency_score: int
    last_updated: datetime
    has_attachments: bool
    participants: list = []   # needed by inbox ThreadRow for sender display
    is_unread: int = 0        # 0 = read, 1 = unread
    tags: List[str] = []      # contact and thread flags/tags

@router.get("", response_model=List[ThreadListItem])
@router.get("/", response_model=List[ThreadListItem], include_in_schema=False)
async def list_threads(
    limit: int = Query(default=40, le=100),
    offset: int = Query(default=0, ge=0),
    intent: Optional[str] = Query(default=None, description="Filter by intent: urgent, action_required, fyi"),
    q: Optional[str] = Query(default=None, description="Search query (subject + summary)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List email threads for current user.
    
    Returns threads sorted by last_updated descending.
    Filters out threads where the most recent sender is an unsubscribed contact.
    """


    sender_is_unsubscribed = exists(
        select(Contact.id).where(
            Contact.user_id == current_user.id,
            Contact.is_unsubscribed == True,
            # sender may be "Name <email>" — ILIKE with % handles both formats
            Email.sender.ilike(func.concat('%', Contact.email_address, '%'))
        ).correlate(Email)
    )

    # Build WHERE filters
    filters = [
        Thread.user_id == current_user.id,
        or_(
            Email.id == None,          # thread has no emails yet – always show
            ~sender_is_unsubscribed    # sender is NOT a known unsubscribed contact
        )
    ]

    # Intent filter (urgent / action_required / fyi)
    if intent and intent != 'all':
        filters.append(Thread.intent == intent)

    # Full-text search across subject + summary
    if q:
        q_like = f'%{q}%'
        filters.append(
            or_(
                Thread.subject.ilike(q_like),
                Thread.summary.ilike(q_like),
            )
        )

    stmt = (
        select(Thread)
        # LEFT JOIN to get the most recent email for each thread
        .outerjoin(
            Email,
            and_(
                Email.thread_id == Thread.id,
                Email.received_at == Thread.last_email_at
            )
        )
        .options(selectinload(Thread.tags))
        .where(*filters)
        .order_by(desc(Thread.last_email_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    threads = result.scalars().all()
    
    # Efficiently fetch sender contact tags to avoid N+1
    sender_emails = []
    for t in threads:
        if t.participants:
            # First participant is usually the sender (sorted earlier if needed)
            p = t.participants[0]
            email_match = re.search(r'<(.+?)>', p)
            email = email_match.group(1).lower() if email_match else p.lower().strip()
            sender_emails.append(email)
            
    contact_map = {}
    if sender_emails:
        contact_stmt = select(Contact).where(
            Contact.user_id == current_user.id,
            Contact.email_address.in_(sender_emails)
        ).options(selectinload(Contact.tags))
        c_result = await db.execute(contact_stmt)
        for c in c_result.scalars().all():
            contact_map[c.email_address.lower()] = [tag.name for tag in c.tags]

    user_email = current_user.email.lower() if current_user.email else ""
    return [
        ThreadListItem(
            thread_id=t.id,
            external_id=t.external_id,
            subject=t.subject or "(No Subject)",
            summary=t.summary or "Pending analysis...",
            intent=t.intent or "processing",
            urgency_score=t.urgency_score or 0,
            last_updated=t.last_email_at or datetime.now(timezone.utc),
            has_attachments=t.has_attachments or False,
            # Sort participants so the user themselves appears last, putting the other sender at index 0
            participants=sorted(list(t.participants or []), key=lambda p: user_email in p.lower()),
            is_unread=t.is_unread or 0,
            tags=list(set(
                ([tag.name for tag in t.tags] if t.tags else []) +
                (contact_map.get((re.search(r'<(.+?)>', t.participants[0]).group(1).lower() if t.participants and re.search(r'<(.+?)>', t.participants[0]) else t.participants[0].lower().strip() if t.participants else ""), []))
            )),
        )
        for t in threads
    ]


class NavCounts(BaseModel):
    inbox: int = 0         # unread threads
    actions: int = 0       # action_required threads
    urgent: int = 0        # urgent threads
    fyi: int = 0           # fyi threads
    drafts: int = 0        # pending drafts


@router.get("/counts", response_model=NavCounts)
async def get_nav_counts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lightweight counts for sidebar badges — avoids loading full thread list."""
    from models.draft import Draft, DraftStatus as DS
    from sqlalchemy import case, literal_column

    result = await db.execute(
        select(
            func.count().filter(Thread.is_unread > 0).label("inbox"),
            func.count().filter(Thread.intent == "action_required").label("actions"),
            func.count().filter(Thread.intent == "urgent").label("urgent"),
            func.count().filter(Thread.intent == "fyi").label("fyi"),
        ).where(Thread.user_id == current_user.id)
    )
    row = result.one()

    # Draft count (generated, not yet sent)
    draft_count_res = await db.execute(
        select(func.count()).where(
            Draft.user_id == current_user.id,
            Draft.status == DS.GENERATED.value,
        )
    )
    draft_count = draft_count_res.scalar() or 0

    return NavCounts(
        inbox=row.inbox or 0,
        actions=row.actions or 0,
        urgent=row.urgent or 0,
        fyi=row.fyi or 0,
        drafts=draft_count,
    )



from contracts.ingestion import EmailThreadV1, EmailMessage, AttachmentRef
from contracts.intelligence import ThreadIntelV1
from contracts.workflow import TaskDTOv1, DraftDTOv1
from models.attachment import Attachment

# Helper to serialize ThreadIntel
def _serialize_intel(t: Thread) -> Optional[ThreadIntelV1]:
    if not t.intel_json and not t.summary:
        return None
        
    # If we have JSON cache, use it
    if t.intel_json:
        # Pydantic parse
        try:
            return ThreadIntelV1(**t.intel_json)
        except:
            pass
            
    # Construct partial from columns
    return ThreadIntelV1(
        thread_id=t.id,
        summary=t.summary or "",
        intent=t.intent or "unknown",
        urgency_score=t.urgency_score or 0,
        main_ask=None,
        decision_needed=None,
        extracted_deadlines=[],
        entities=[],
        attachment_summaries=[],
        suggested_action=None,
        suggested_reply_points=[],
        schema_version="v0-partial",
        processed_at=t.intel_generated_at or datetime.now(timezone.utc)
    )

class ThreadDetailResponse(BaseModel):
    thread: EmailThreadV1
    intel: Optional[ThreadIntelV1]
    tasks: List[TaskDTOv1]
    draft: Optional[DraftDTOv1]


@router.get("/{thread_id}/intel-status")
async def get_intel_status(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check if intelligence is ready (polling endpoint).
    Returns basic status and summary if completed.
    """
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == current_user.id)
    result = await db.execute(stmt)
    thread = result.scalars().first()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    status = "completed" if thread.summary else "processing"
    
    return {
        "status": status,
        "summary": thread.summary if status == "completed" else None
    }



@router.get("/{thread_id}", response_model=ThreadDetailResponse)
async def get_thread(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get full thread details including messages, attachments, and intelligence.
    """
    # 1. Fetch Thread
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == current_user.id)
    result = await db.execute(stmt)
    thread = result.scalars().first()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    # 2. Fetch Messages
    from models.email import Email
    msg_stmt = select(Email).where(Email.thread_id == thread_id).order_by(Email.received_at)
    msg_result = await db.execute(msg_stmt)
    messages = msg_result.scalars().all()
    
    # 3. Fetch Attachments
    from models.attachment import Attachment
    email_ids = [m.id for m in messages] if messages else []
    if email_ids:
        att_stmt = select(Attachment).where(Attachment.email_id.in_(email_ids))
        att_result = await db.execute(att_stmt)
        attachments = att_result.scalars().all()
    else:
        attachments = []
    # 4. Construct Encapsulated Objects
    from models.task import Task, TaskStatus as DBTaskStatus
    from models.draft import Draft, DraftStatus
    
    task_stmt = select(Task).where(
        Task.source_thread_id == thread_id, 
        Task.status.in_([DBTaskStatus.PENDING, DBTaskStatus.IN_PROGRESS])
    )
    task_res = await db.execute(task_stmt)
    db_tasks = task_res.scalars().all()
    
    draft_stmt = select(Draft).where(
        Draft.thread_id == thread_id,
        Draft.status == DraftStatus.GENERATED.value
    ).order_by(Draft.created_at.desc()).limit(1)
    draft_res = await db.execute(draft_stmt)
    db_draft = draft_res.scalars().first()

    normalized_messages = []
    for m in messages:
        to_addrs = [r.get("email") for r in m.recipients if r.get("type") == "to"] if m.recipients else []
        cc_addrs = [r.get("email") for r in m.recipients if r.get("type") == "cc"] if m.recipients else []
        
        # Sandbox image requests through proxy
        raw_html = m.body_html or ""
        
        # Derive backend base URL using the known Google OAuth Callback
        backend_url = settings.GOOGLE_REDIRECT_URI.replace("/api/auth/google/callback", "")
        if not backend_url.startswith("http"):
            backend_url = "https://sortmail-production.up.railway.app"

        safed_html = re.sub(
            r'src=["\'](https?://[^"\']+)["\']',
            lambda match: f'src="{backend_url}/api/proxy/image?url={quote(match.group(1), safe="")}"',
            raw_html
        )
        
        # Safe HTML: Fix malformed viewport meta tags from external email clients (e.g. width=device-width;)
        safed_html = re.sub(
            r'<meta[^>]*name=["\']viewport["\'][^>]*>',
            lambda match: match.group(0).replace(";", ","),
            safed_html,
            flags=re.IGNORECASE
        )

        normalized_messages.append(
            EmailMessage(
                message_id=m.id,
                from_address=m.sender or "",
                to_addresses=to_addrs,
                cc_addresses=cc_addrs,
                subject=m.subject or "",
                body_text=m.body_plain or "",
                body_html=safed_html,
                sent_at=m.sent_at or m.received_at, # Fallback to received_at if sent_at is missing
                received_at=m.received_at,
                is_from_user=bool(m.is_from_user),
                labels=[] # emails table doesn't have labels yet
            )
        )
    
    normalized_attachments = [
        AttachmentRef(
            attachment_id=a.id,
            email_id=a.email_id,
            filename=a.filename_sanitized or a.filename,
            original_filename=a.filename,
            mime_type=a.mime_type,
            storage_path=a.storage_path or "",
            size_bytes=a.size_bytes,
        )
        for a in attachments
    ]
    
    user_email = current_user.email.lower() if current_user.email else ""
    sorted_participants = sorted(list(thread.participants or []), key=lambda p: user_email in p.lower())

    email_thread = EmailThreadV1(
        thread_id=thread.id,
        external_id=thread.external_id,
        subject=thread.subject or "(No Subject)",
        participants=sorted_participants,
        messages=normalized_messages,
        attachments=normalized_attachments,
        last_updated=thread.last_email_at or datetime.now(timezone.utc),
        provider=thread.provider,
        labels=thread.labels or [],
        is_unread=bool(thread.is_unread),
        is_starred=thread.is_starred or False,
    )
    
    # 5. Fetch Tasks / Drafts
    
    def _map_priority(level: str) -> str:
        level = (level or "").lower()
        if level in ["urgent", "critical", "do_now"]: return "do_now"
        if level in ["high", "do_today"]: return "do_today"
        return "can_wait"

    tasks = [
        TaskDTOv1(
            task_id=t.id,
            thread_id=t.source_thread_id,
            user_id=t.user_id,
            title=t.title,
            description=t.description,
            task_type=t.task_type.value if hasattr(t.task_type, 'value') else str(t.task_type).lower(),
            priority=_map_priority(t.priority_level),
            priority_score=t.priority_score or 0,
            status=t.status.value if hasattr(t.status, 'value') else str(t.status).lower(),
            created_at=t.created_at or datetime.now(timezone.utc),
            updated_at=t.updated_at or datetime.now(timezone.utc),
        ) for t in db_tasks
    ]
    
    draft = None
    if db_draft:
        placeholders = db_draft.metadata_json.get("placeholders", []) if db_draft.metadata_json else []
        draft = DraftDTOv1(
            draft_id=db_draft.id,
            thread_id=db_draft.thread_id,
            user_id=db_draft.user_id,
            content=db_draft.body,
            tone=db_draft.tone.lower() if db_draft.tone else "normal",
            placeholders=placeholders,
            has_unresolved_placeholders=len(placeholders) > 0,
            created_at=db_draft.created_at or datetime.now(timezone.utc),
            schema_version=db_draft.generation_model or "unknown"
        )
    
    return ThreadDetailResponse(
        thread=email_thread,
        intel=_serialize_intel(thread),
        tasks=tasks,
        draft=draft
    )


@router.post("/{thread_id}/refresh")
async def refresh_thread(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Re-process thread intelligence. (Cost: 2 credits)
    
    Useful after new emails arrive or if user wants updated analysis.
    """
    OPERATION_TYPE = "thread_summary"
    
    # 1. Verify thread belongs to user
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == current_user.id)
    result = await db.execute(stmt)
    thread = result.scalars().first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # 2. Check Balance
    if not await CreditService.check_balance(db, current_user.id, OPERATION_TYPE):
         raise HTTPException(status_code=402, detail="Insufficient credits.")

    try:
        # 3. Deduct Credits
        await CreditService.deduct_credits(
            db, user_id=current_user.id, operation_type=OPERATION_TYPE,
            metadata={"thread_id": thread_id, "action": "refresh"}
        )
        
        # 4. Force re-process by clearing the intel timestamp
        thread.intel_generated_at = None
        await db.commit()
        
        # 5. Trigger intelligence pipeline in background
        import asyncio
        from core.ingestion.sync_service import _run_intel_safe
        asyncio.create_task(_run_intel_safe(thread_id, current_user.id, db))
        
        return {"thread_id": thread_id, "status": "processing", "message": "Intelligence refresh queued"}
    except InsufficientCreditsError as e:
        await db.rollback()
        raise HTTPException(status_code=402, detail=str(e))
    except RateLimitExceededError as e:
        await db.rollback()
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{thread_id}/intel")
async def get_thread_intel(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get intelligence profile for a thread.
    
    Returns cached intel immediately if available.
    If not yet generated, triggers the pipeline and returns a 202 Accepted.
    """
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == current_user.id)
    result = await db.execute(stmt)
    thread = result.scalars().first()
    
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Return cached intel if present
    if thread.intel_json:
        return {
            "status": "completed",
            "thread_id": thread_id,
            "intel": thread.intel_json,
        }

    # Trigger pipeline in background if not yet processed
    import asyncio
    from core.ingestion.sync_service import _run_intel_safe
    asyncio.create_task(_run_intel_safe(thread_id, current_user.id, db))
    
    return {
        "status": "processing",
        "thread_id": thread_id,
        "message": "Intelligence is being generated. Poll /intel-status for updates.",
    }
