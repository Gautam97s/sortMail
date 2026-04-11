"""
Admin API - Credit Management
-----------------------------
Endpoints for managing credit pricing and user balances.
Restricted to Superusers.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, case, or_
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


class AdminCreditSummary(BaseModel):
    total_credits_issued: int
    active_consumption_30d: int
    purchase_credits_30d: int
    pending_refunds: int


class AdminCreditTransactionOut(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    amount: int
    balance_after: int
    transaction_type: str
    operation_type: Optional[str] = None
    status: str
    created_at: datetime

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


@router.get("/summary", response_model=AdminCreditSummary)
async def get_credit_summary(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser),
):
    """Get aggregate credit-economy metrics for admin overview."""
    _ = admin

    last_30_days = datetime.now(timezone.utc) - timedelta(days=30)

    issued_stmt = select(
        func.coalesce(func.sum(CreditTransaction.amount), 0)
    ).where(
        CreditTransaction.status == "COMPLETED",
        CreditTransaction.amount > 0,
    )
    total_credits_issued = int((await db.execute(issued_stmt)).scalar() or 0)

    consumed_stmt = select(
        func.coalesce(func.sum(func.abs(CreditTransaction.amount)), 0)
    ).where(
        CreditTransaction.status == "COMPLETED",
        CreditTransaction.amount < 0,
        CreditTransaction.created_at >= last_30_days,
    )
    active_consumption_30d = int((await db.execute(consumed_stmt)).scalar() or 0)

    purchased_stmt = select(
        func.coalesce(func.sum(CreditTransaction.amount), 0)
    ).where(
        CreditTransaction.status == "COMPLETED",
        CreditTransaction.transaction_type == TransactionType.PURCHASE,
        CreditTransaction.created_at >= last_30_days,
    )
    purchase_credits_30d = int((await db.execute(purchased_stmt)).scalar() or 0)

    pending_refunds_stmt = select(
        func.count(CreditTransaction.id)
    ).where(
        CreditTransaction.transaction_type == TransactionType.REFUND,
        CreditTransaction.status == "RESERVED",
    )
    pending_refunds = int((await db.execute(pending_refunds_stmt)).scalar() or 0)

    return AdminCreditSummary(
        total_credits_issued=total_credits_issued,
        active_consumption_30d=active_consumption_30d,
        purchase_credits_30d=purchase_credits_30d,
        pending_refunds=pending_refunds,
    )


@router.get("/transactions", response_model=List[AdminCreditTransactionOut])
async def get_credit_transactions(
    limit: int = 100,
    offset: int = 0,
    query: Optional[str] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_superuser),
):
    """Get platform-wide credit transactions for admin ledger view."""
    _ = admin

    safe_limit = max(1, min(limit, 500))
    safe_offset = max(0, offset)

    stmt = (
        select(CreditTransaction, User)
        .join(User, User.id == CreditTransaction.user_id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(safe_limit)
        .offset(safe_offset)
    )

    if transaction_type:
        stmt = stmt.where(CreditTransaction.transaction_type == transaction_type)
    if status:
        stmt = stmt.where(CreditTransaction.status == status)
    if query:
        like = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                CreditTransaction.id.ilike(like),
                User.email.ilike(like),
                User.name.ilike(like),
            )
        )

    rows = (await db.execute(stmt)).all()
    return [
        AdminCreditTransactionOut(
            id=tx.id,
            user_id=tx.user_id,
            user_email=user.email,
            user_name=user.name,
            amount=tx.amount,
            balance_after=tx.balance_after,
            transaction_type=tx.transaction_type.value if tx.transaction_type else "",
            operation_type=tx.operation_type,
            status=tx.status.value if tx.status else "",
            created_at=tx.created_at,
        )
        for tx, user in rows
    ]
