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
from core.credits.credit_service import CreditService, InsufficientCreditsError, RateLimitExceededError

router = APIRouter()


class DraftRequest(BaseModel):
    """Request to generate a draft reply."""
    thread_id: str
    tone: ToneType = ToneType.NORMAL
    additional_context: Optional[str] = None


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
