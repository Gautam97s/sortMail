"""
API Routes - Drafts
-------------------
Draft generation endpoints.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from core.storage.database import get_db
from models.draft import ToneType
from api.dependencies import get_current_user
from models.user import User
from models.draft import Draft, DraftStatus, DraftTone
from core.credits.credit_service import CreditService, InsufficientCreditsError, RateLimitExceededError
from sqlalchemy import select, desc, and_, or_, func, exists
import logging
import uuid
from datetime import datetime, timezone
from core.intelligence.pipeline import _load_thread, _load_messages
from core.intelligence.llama_engine import _call_llama

logger = logging.getLogger(__name__)

router = APIRouter()


class DraftRequest(BaseModel):
    """Request to generate a draft reply."""
    thread_id: str
    tone: ToneType = ToneType.NORMAL
    additional_context: Optional[str] = None


class DraftResponse(BaseModel):
    id: str
    thread_id: str
    external_id: str
    subject: str
    body: str
    tone: str
    status: str
    created_at: str

    class Config:
        from_attributes = True

class ScheduleDraftRequest(BaseModel):
    scheduled_for_date: str # ISO format expected


@router.post("/", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a draft reply for a thread. (Cost: 3 credits)
    """
    OPERATION_TYPE = "draft_reply"
    
    # 1. Check Balance
    has_credits = await CreditService.check_balance(db, current_user.id, OPERATION_TYPE)
    if not has_credits:
         raise HTTPException(
             status_code=402, 
             detail="Insufficient credits. Please upgrade or purchase more credits."
         )

    # TODO: Implement real draft generation with LLM
    try:
        # Load real thread and context
        thread = await _load_thread(request.thread_id, current_user.id, db)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
            
        messages = await _load_messages(request.thread_id, db)
        messages_text = ""
        for m in messages:
            sender = m.get("from", "Unknown")
            body = m.get("body", "").strip()[:500]
            messages_text += f"From: {sender}\n{body}\n\n"
            
        tone_val = request.tone.value if hasattr(request.tone, 'value') else request.tone
        prompt = f"""Write a professional email reply for the following thread.
Tone: {tone_val}
Additional Instructions: {request.additional_context or 'None'}

Thread Context:
{messages_text}

Provide ONLY the raw email body text. Do not include subject lines or enclosed Markdown formatting. Keep it concise."""

        chat_messages = [{"role": "user", "content": prompt}]
        generated_text = (await _call_llama(chat_messages, max_tokens=1000)).strip()
        
        draft = Draft(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            thread_id=request.thread_id,
            subject=f"Re: {thread.subject}",
            content=generated_text,
            body=generated_text,
            tone=request.tone,
            generation_model="llama-3.3-70b-instruct",
            status=DraftStatus.GENERATED.value
        )
        db.add(draft)
        
        # 2. Deduct Credits (only on success)
        await CreditService.deduct_credits(
            db, 
            current_user.id, 
            OPERATION_TYPE, 
            related_entity_id=draft.id,
            metadata={"thread_id": request.thread_id, "tone": request.tone}
        )
        await db.commit() # Commit deduction and draft insertion
        
        return {
            "id": draft.id,
            "thread_id": draft.thread_id,
            "external_id": thread.external_id,
            "subject": draft.subject,
            "body": draft.body,
            "tone": draft.tone,
            "status": draft.status,
            "created_at": draft.created_at.isoformat() if draft.created_at else ""
        }
    except InsufficientCreditsError:
        await db.rollback()
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    except RateLimitExceededError as e:
        await db.rollback()
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {str(e)}")


@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an existing draft."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    thread = await _load_thread(draft.thread_id, current_user.id, db)
    return {
        "id": draft.id,
        "thread_id": draft.thread_id,
        "external_id": thread.external_id if thread else "",
        "subject": draft.subject,
        "body": draft.body,
        "tone": draft.tone,
        "status": draft.status,
        "created_at": draft.created_at.isoformat() if draft.created_at else ""
    }


@router.post("/{draft_id}/regenerate", response_model=DraftResponse)
async def regenerate_draft(
    draft_id: str,
    tone: Optional[ToneType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate a draft. (Cost: 3 credits)"""
    OPERATION_TYPE = "draft_reply"

    # 1. Check Balance
    if not await CreditService.check_balance(db, current_user.id, OPERATION_TYPE):
         raise HTTPException(status_code=402, detail="Insufficient credits.")

    try:
        # 1. Fetch existing draft to get thread_id reference
        stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
        draft = (await db.execute(stmt)).scalars().first()
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")

        # 2. Load context
        thread = await _load_thread(draft.thread_id, current_user.id, db)
        if not thread:
            raise HTTPException(status_code=404, detail="Source thread not found")
        messages = await _load_messages(draft.thread_id, db)
        
        # 3. Formulate Prompt
        messages_text = ""
        for m in messages:
            sender = m.get("from", "Unknown")
            body = m.get("body", "").strip()[:500]
            messages_text += f"From: {sender}\n{body}\n\n"
            
        target_tone = tone or draft.tone
        tone_val = target_tone.value if hasattr(target_tone, 'value') else target_tone
        prompt = f"""Rewrite a professional email reply for the following thread.
Tone: {tone_val}

Thread Context:
{messages_text}

Provide ONLY the raw email body text. Do not include subject lines or enclosed Markdown formatting. Keep it concise."""

        # 4. Generate
        chat_messages = [{"role": "user", "content": prompt}]
        generated_text = (await _call_llama(chat_messages, max_tokens=1000)).strip()
        
        # 5. Update draft
        draft.content = generated_text
        draft.body = generated_text
        if tone:
            draft.tone = tone

        # 6. Deduct
        await CreditService.deduct_credits(
            db, user_id=current_user.id, operation_type=OPERATION_TYPE,
            metadata={"draft_id": draft_id, "action": "regenerate", "tone": tone_val}
        )
        await db.commit()
        
        return {
            "id": draft.id,
            "thread_id": draft.thread_id,
            "external_id": thread.external_id,
            "subject": draft.subject,
            "body": draft.body,
            "tone": draft.tone,
            "status": draft.status,
            "created_at": draft.created_at.isoformat() if draft.created_at else ""
        }
    except InsufficientCreditsError as e:
        await db.rollback()
        raise HTTPException(status_code=402, detail=str(e))
    except RateLimitExceededError as e:
        await db.rollback()
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise e


@router.delete("/{draft_id}")
async def delete_draft(draft_id: str):
    """Delete a draft."""
    return {"draft_id": draft_id, "deleted": True}


@router.get("", response_model=list[DraftResponse])
async def list_drafts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all pending AI drafts for the current user.

    Excludes drafts for threads whose latest sender is an unsubscribed contact.
    """
    from models.thread import Thread
    from models.email import Email
    from models.contact import Contact

    # Correlated NOT EXISTS: same pattern as /api/threads
    sender_is_unsubscribed = exists(
        select(Contact.id).where(
            Contact.user_id == current_user.id,
            Contact.is_unsubscribed == True,
            Email.sender.ilike(func.concat('%', Contact.email_address, '%'))
        ).correlate(Email)
    )

    unsub_thread_ids = (
        select(Thread.id)
        .join(Email, and_(Email.thread_id == Thread.id, Email.received_at == Thread.last_email_at))
        .where(
            Thread.user_id == current_user.id,
            sender_is_unsubscribed
        )
        .scalar_subquery()
    )

    stmt = (
        select(Draft)
        .where(
            Draft.user_id == current_user.id,
            Draft.status == DraftStatus.GENERATED.value,
            Draft.thread_id.not_in(unsub_thread_ids)
        )
        .order_by(desc(Draft.created_at))
    )
    drafts = (await db.execute(stmt)).scalars().all()

    result = []
    for d in drafts:
        result.append({
            "id": d.id,
            "thread_id": d.thread_id,
            "subject": d.subject,
            "body": d.body,
            "tone": d.tone,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else ""
        })
    return result

@router.post("/{draft_id}/approve")
async def approve_draft_for_send(
    draft_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a draft to be sent immediately."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    draft.status = DraftStatus.SENT.value
    # TODO: Push to email provider APIs via background jobs
    draft.sent_at = datetime.now(timezone.utc)
    
    await db.commit()
    return {"status": "success", "message": "Draft approved for sending"}

@router.post("/{draft_id}/schedule")
async def schedule_draft(
    draft_id: str,
    payload: ScheduleDraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a draft for 'Send Later' via background workers."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    draft.status = DraftStatus.EDITED.value # Means it was reviewed
    
    try:
        scheduled_time = datetime.fromisoformat(payload.scheduled_for_date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ISO date format.")
        
    # In a full deployment, enqueue to Redis/Celery here using scheduled_time
    logger.info(f"Draft {draft_id} scheduled to send at {scheduled_time}")
    
    draft.metadata_json = draft.metadata_json or {}
    draft.metadata_json["scheduled_for"] = scheduled_time.isoformat()
    
    await db.commit()
    return {"status": "success", "message": f"Draft scheduled for {scheduled_time.isoformat()}"}

