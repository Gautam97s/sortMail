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

router = APIRouter(redirect_slashes=False)


class ThreadListItem(BaseModel):
    """Lightweight thread for list view."""
    thread_id: str
    subject: str
    summary: str
    intent: str
    urgency_score: int
    last_updated: datetime
    has_attachments: bool
    participants: list = []   # needed by inbox ThreadRow for sender display
    is_unread: int = 0        # 0 = read, 1 = unread


from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.config import settings

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.thread import Thread
from models.email import Email
from models.contact import Contact
from sqlalchemy import and_, or_, func, any_
from core.credits.credit_service import CreditService, InsufficientCreditsError, RateLimitExceededError

@router.get("", response_model=List[ThreadListItem])
@router.get("/", response_model=List[ThreadListItem], include_in_schema=False)
async def list_threads(
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List email threads for current user.
    
    Returns threads sorted by last_updated descending.
    Filters out threads where the most recent sender is an unsubscribed contact.
    """
    # Subquery to find the latest sender for each thread (Postgres specific DISTINCT ON)
    from sqlalchemy import func
    
    # Simple join approach: Get threads where the last_email_at matches an email sender's received_at
    # This is slightly optimistic but works well for most cases without complex DISTINCT ON emulation in asyncpg
    from sqlalchemy import cast, String
    stmt = (
        select(Thread)
        .outerjoin(Email, and_(Email.thread_id == Thread.id, Email.received_at == Thread.last_email_at))
        .outerjoin(Contact, and_(
            Contact.user_id == current_user.id,
            or_(
                Email.sender.ilike(func.concat('%', Contact.email_address, '%')),
                func.lower(Contact.email_address) == any_(Email.recipients)
            )
        ))
        .where(
            Thread.user_id == current_user.id,
            or_(Contact.is_unsubscribed == False, Contact.is_unsubscribed == None)
        )
        .order_by(desc(Thread.last_email_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    threads = result.scalars().all()
    
    return [
        ThreadListItem(
            thread_id=t.id,
            subject=t.subject or "(No Subject)",
            summary=t.summary or "Pending analysis...",
            intent=t.intent or "processing",
            urgency_score=t.urgency_score or 0,
            last_updated=t.last_email_at or datetime.now(timezone.utc),
            has_attachments=t.has_attachments or False,
            participants=list(t.participants or []),
            is_unread=t.is_unread or 0,
        )
        for t in threads
    ]




from typing import List, Optional, Dict, Any
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
    
    email_thread = EmailThreadV1(
        thread_id=thread.id,
        external_id=thread.external_id,
        subject=thread.subject or "(No Subject)",
        participants=thread.participants or [],
        messages=normalized_messages,
        attachments=normalized_attachments,
        last_updated=thread.last_email_at or datetime.now(timezone.utc),
        provider=thread.provider,
        labels=thread.labels or [],
        is_unread=bool(thread.is_unread),
        is_starred=thread.is_starred or False,
    )
    
    # 5. Fetch Tasks / Drafts (Stubs for now, or real if table exists)
    # Assuming Task model exists, import it globally if so.
    # For now return empty list to unblock.
    tasks = [] 
    draft = None
    
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
