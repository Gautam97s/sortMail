"""
API Routes - Drafts
-------------------
Draft generation endpoints.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from contracts import DraftDTOv1, ToneType
from contracts.mocks import create_mock_draft
from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.draft import Draft, DraftStatus, DraftTone
from core.credits.credit_service import CreditService, InsufficientCreditsError, RateLimitExceededError
from sqlalchemy import select, desc
import logging
from datetime import datetime, timezone

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
    subject: str
    body: str
    tone: str
    status: str
    created_at: str

    class Config:
        from_attributes = True

class ScheduleDraftRequest(BaseModel):
    scheduled_for_date: str # ISO format expected


@router.post("/", response_model=DraftDTOv1)
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
        # Simulate AI processing...
        draft = create_mock_draft()
        draft.thread_id = request.thread_id
        draft.tone = request.tone
        
        # 2. Deduct Credits (only on success)
        await CreditService.deduct_credits(
            db, 
            current_user.id, 
            OPERATION_TYPE, 
            related_entity_id=None, # or draft.id if we had it persistence
            metadata={"thread_id": request.thread_id, "tone": request.tone}
        )
        await db.commit() # Commit deduction
        
        return draft
    except InsufficientCreditsError:
        await db.rollback()
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    except RateLimitExceededError as e:
        await db.rollback()
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {str(e)}")


@router.get("/{draft_id}", response_model=DraftDTOv1)
async def get_draft(draft_id: str):
    """Get an existing draft."""
    # TODO: Replace with real DB query
    draft = create_mock_draft()
    draft.draft_id = draft_id
    return draft


@router.post("/{draft_id}/regenerate", response_model=DraftDTOv1)
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
        # TODO: Implement regeneration
        draft = create_mock_draft()
        draft.draft_id = draft_id
        if tone:
            draft.tone = tone
            
        # 2. Deduct
        await CreditService.deduct_credits(
            db, user_id=current_user.id, operation_type=OPERATION_TYPE,
            metadata={"draft_id": draft_id, "action": "regenerate"}
        )
        await db.commit()
        
        return draft
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
    """List all pending AI drafts for the current user."""
    stmt = (
        select(Draft)
        .where(Draft.user_id == current_user.id, Draft.status == DraftStatus.GENERATED)
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
            "tone": d.tone.value,
            "status": d.status.value,
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
        
    draft.status = DraftStatus.SENT
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
        
    draft.status = DraftStatus.EDITED # Means it was reviewed
    
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

