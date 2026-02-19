"""
Admin API - Credit Management
-----------------------------
Endpoints for managing credit pricing and user balances.
Restricted to Superusers.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel

from core.storage.database import get_db
from core.credits.credit_service import CreditService
from models.credits import CreditPricing, TransactionType, UserCredits, CreditTransaction
from models.user import User
from api.dependencies import get_current_user

router = APIRouter()

# --- Dependencies ---

async def get_superuser(current_user: User = Depends(get_current_user)) -> User:
    """Ensure user is a superuser."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- DTOs ---

class PricingUpdate(BaseModel):
    operation_type: str
    credits_cost: int
    is_active: Optional[bool] = None
    description: Optional[str] = None

class CreditAdjustment(BaseModel):
    user_id: UUID
    amount: int  # Positive to add, Negative to deduct
    reason: str

class UserCreditInfo(BaseModel):
    user_id: UUID
    balance: int
    total_earned: int
    total_spent: int
    plan: str

# --- Endpoints ---

@router.get("/pricing", response_model=List[PricingUpdate])
async def get_pricing(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser)
):
    """List current credit pricing."""
    stmt = select(CreditPricing).order_by(CreditPricing.operation_type)
    result = await db.execute(stmt)
    pricing = result.scalars().all()
    return [
        PricingUpdate(
            operation_type=p.operation_type, 
            credits_cost=p.credits_cost,
            is_active=p.is_active,
            description=p.description
        ) for p in pricing
    ]

@router.post("/pricing")
async def update_pricing(
    update_data: PricingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser)
):
    """Update or create pricing for an operation."""
    stmt = select(CreditPricing).where(CreditPricing.operation_type == update_data.operation_type)
    result = await db.execute(stmt)
    pricing = result.scalar_one_or_none()
    
    if pricing:
        pricing.credits_cost = update_data.credits_cost
        if update_data.is_active is not None:
            pricing.is_active = update_data.is_active
        if update_data.description:
            pricing.description = update_data.description
    else:
        pricing = CreditPricing(
            operation_type=update_data.operation_type,
            credits_cost=update_data.credits_cost,
            is_active=update_data.is_active if update_data.is_active is not None else True,
            description=update_data.description
        )
        db.add(pricing)
    
    await db.commit()
    return {"status": "updated", "operation": update_data.operation_type}

@router.post("/adjust")
async def adjust_user_credits(
    adjustment: CreditAdjustment,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser)
):
    """Manually add or deduct credits from a user."""
    
    # Use CreditService for safety
    if adjustment.amount > 0:
        new_balance = await CreditService.add_credits(
            db, 
            adjustment.user_id, 
            adjustment.amount, 
            TransactionType.ADMIN_ADJUSTMENT,
            metadata={"reason": adjustment.reason, "admin_id": str(admin.id)}
        )
    elif adjustment.amount < 0:
        # Deduct (amount is negative, but deduct_credits expects positive cost usually, 
        # but here we can just add negative amount via add_credits logic OR use deduct logic.
        # CreditService.deduct_credits logs as DEDUCTION.
        # CreditService.add_credits logs as ADMIN_ADJUSTMENT if we pass that type.
        # Let's use add_credits with negative amount to keep type as ADMIN_ADJUSTMENT.
        new_balance = await CreditService.add_credits(
            db, 
            adjustment.user_id, 
            adjustment.amount, # Negative
            TransactionType.ADMIN_ADJUSTMENT,
            metadata={"reason": adjustment.reason, "admin_id": str(admin.id)}
        )
    else:
        return {"status": "no_change"}
        
    await db.commit()
    return {"status": "success", "new_balance": new_balance}

@router.get("/users/{user_id}", response_model=UserCreditInfo)
async def get_user_credits(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser)
):
    """Get credit details for a user."""
    credits = await CreditService.get_or_create_user_credits(db, user_id)
    return UserCreditInfo(
        user_id=credits.user_id,
        balance=credits.credits_balance,
        total_earned=credits.credits_total_earned,
        total_spent=credits.credits_total_spent,
        plan=credits.plan
    )
