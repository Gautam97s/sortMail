"""
API Routes - Credits
--------------------
User-facing credit balance and transaction history endpoints.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from pydantic import BaseModel

from core.storage.database import get_db
from api.dependencies import get_current_user
from models.user import User
from models.credits import UserCredits, CreditTransaction, TransactionType, TransactionStatus
from core.credits.credit_service import CreditService
from core.credits.token_pricing import milli_to_credits, credits_to_milli

router = APIRouter()


class CreditBalanceResponse(BaseModel):
    balance: float
    plan: str
    monthly_allowance: float
    used_this_month: float
    resets_on: Optional[str]  # ISO date string
    bonus_available: float = 0
    bonus_consumed_this_cycle: float = 0
    monthly_remaining: float = 0
    total_spent_this_cycle: float = 0
    raw_used_this_month: float = 0
    consumption_policy: str = "bonus_first_then_monthly"


class TransactionOut(BaseModel):
    id: str
    amount: float
    balance_after: float
    transaction_type: str
    operation_type: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/me", response_model=CreditBalanceResponse)
async def get_my_credits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's credit balance and plan info."""
    credits = await CreditService.get_or_create_user_credits(db, current_user.id)

    plan_name = credits.plan.value if credits.plan else "FREE"
    plan_defaults = {
        "FREE": credits_to_milli(2000),
        "PRO": credits_to_milli(8000),
        "TEAM": credits_to_milli(2000),
        "ENTERPRISE": credits_to_milli(10000),
    }
    stored_allowance = int(credits.monthly_credits_allowance or 0)
    plan_allowance = int(plan_defaults.get(plan_name.upper(), stored_allowance or 50))

    # If allowance is unset (or stale default for non-free plans), derive from plan.
    monthly_allowance = int(stored_allowance)
    if monthly_allowance <= 0 or (plan_name.upper() != "FREE" and monthly_allowance in {50, 500}):
        monthly_allowance = plan_allowance

    # Compute monthly usage from transaction ledger for current billing cycle.
    # This avoids stale counters and guarantees the UI reflects real consumption.
    raw_used_this_month = int(credits.credits_used_this_month or 0)
    total_spent_this_cycle = 0
    if credits.billing_cycle_start:
        cycle_start_dt = datetime.combine(
            credits.billing_cycle_start,
            datetime.min.time(),
            tzinfo=timezone.utc,
        )

        usage_stmt = select(
            func.coalesce(func.sum(func.abs(CreditTransaction.amount)), 0)
        ).where(
            CreditTransaction.user_id == current_user.id,
            CreditTransaction.transaction_type == TransactionType.DEDUCTION,
            CreditTransaction.status == TransactionStatus.COMPLETED,
            CreditTransaction.amount < 0,
            CreditTransaction.created_at >= cycle_start_dt,
        )
        total_spent_this_cycle = int((await db.execute(usage_stmt)).scalar() or 0)
        raw_used_this_month = total_spent_this_cycle

        # Bonus-first consumption model for UI:
        # Extra credits are consumed before touching monthly subscription allowance.
        bonus_available = max(int(credits.credits_balance or 0) - monthly_allowance, 0)
        monthly_used_after_bonus = max(total_spent_this_cycle - bonus_available, 0)
        monthly_used_after_bonus = min(monthly_used_after_bonus, monthly_allowance)

        if raw_used_this_month != int(credits.credits_used_this_month or 0):
            credits.credits_used_this_month = raw_used_this_month
    else:
        bonus_available = max(int(credits.credits_balance or 0) - monthly_allowance, 0)
        monthly_used_after_bonus = 0

    await db.commit()

    bonus_consumed_this_cycle = max(total_spent_this_cycle - monthly_used_after_bonus, 0)
    monthly_remaining = max(monthly_allowance - monthly_used_after_bonus, 0)

    # Calculate reset date (billing_cycle_start + 1 month)
    from dateutil.relativedelta import relativedelta
    resets_on = None
    if credits.billing_cycle_start:
        reset_date = credits.billing_cycle_start + relativedelta(months=1)
        resets_on = reset_date.isoformat()

    return CreditBalanceResponse(
        balance=round(milli_to_credits(credits.credits_balance), 3),
        plan=plan_name,
        monthly_allowance=round(milli_to_credits(monthly_allowance), 3),
        used_this_month=round(milli_to_credits(monthly_used_after_bonus), 3),
        resets_on=resets_on,
        bonus_available=round(milli_to_credits(bonus_available), 3),
        bonus_consumed_this_cycle=round(milli_to_credits(bonus_consumed_this_cycle), 3),
        monthly_remaining=round(milli_to_credits(monthly_remaining), 3),
        total_spent_this_cycle=round(milli_to_credits(total_spent_this_cycle), 3),
        raw_used_this_month=round(milli_to_credits(raw_used_this_month), 3),
        consumption_policy="bonus_first_then_monthly",
    )


@router.get("/me/transactions", response_model=List[TransactionOut])
async def get_my_transactions(
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    type_filter: Optional[str] = Query(default=None, alias="type"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's credit transaction history."""
    stmt = (
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .order_by(desc(CreditTransaction.created_at))
        .limit(limit)
        .offset(offset)
    )
    if type_filter:
        stmt = stmt.where(CreditTransaction.transaction_type == type_filter)

    result = await db.execute(stmt)
    transactions = result.scalars().all()
    return [
        TransactionOut(
            id=tx.id,
            amount=round(milli_to_credits(tx.amount), 3),
            balance_after=round(milli_to_credits(tx.balance_after), 3),
            transaction_type=tx.transaction_type.value if tx.transaction_type else "",
            operation_type=tx.operation_type,
            status=tx.status.value if tx.status else "",
            created_at=tx.created_at,
        )
        for tx in transactions
    ]
