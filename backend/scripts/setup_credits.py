#!/usr/bin/env python3
"""
Admin Credit Setup Script
--------------------------
Run this once to:
  1. Seed the credit_pricing table with real operation costs
  2. Find Rounak's account and set his balance to 1000 credits
  3. Ensure all existing users have a credit record

Usage (from backend/):
  python scripts/setup_credits.py --rounak-email rounak@example.com

Or without flag — it will find the oldest user and prompt:
  python scripts/setup_credits.py
"""

import asyncio
import argparse
import sys
import os

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
import uuid

from app.config import settings
from models.credits import (
    UserCredits, CreditPricing, CreditTransaction,
    TransactionType, TransactionStatus, PlanType
)
from models.user import User

# ── Pricing catalogue (operation_type → credits_cost) ───────────────────────

PRICING = [
    ("draft_reply",         3,  "Generate an AI draft reply to an email"),
    ("email_analysis",      1,  "Analyse a single email thread (intent, summary, urgency)"),
    ("bulk_analysis",       5,  "Batch analysis of multiple threads"),
    ("rag_query",           1,  "Run a RAG/vector search query"),
    ("ai_chat",             2,  "One AI chatbot message"),
    ("attachment_analysis", 3,  "Extract intelligence from an attachment"),
    ("smart_compose",       2,  "AI-assisted email compose"),
    ("calendar_suggest",    1,  "AI calendar suggestion detection"),
    ("reminders",           1,  "AI follow-up / waiting-for detection"),
    ("export_data",         2,  "Export user data package"),
]


async def seed_pricing(db: AsyncSession):
    """Insert missing CreditPricing rows. Skip if already exists."""
    today = date.today()
    seeded = 0
    skipped = 0

    for op_type, cost, desc in PRICING:
        stmt = select(CreditPricing).where(CreditPricing.operation_type == op_type)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            skipped += 1
            continue

        pricing = CreditPricing(
            id=str(uuid.uuid4()),
            operation_type=op_type,
            credits_cost=cost,
            description=desc,
            is_active=True,
            effective_from=today,
        )
        db.add(pricing)
        seeded += 1

    await db.commit()
    print(f"✅ Pricing seeded: {seeded} new rows, {skipped} already existed.")


async def set_user_credits(db: AsyncSession, email: str, amount: int):
    """Set (or create) a user's credit balance to `amount`."""
    stmt = select(User).where(User.email.ilike(email))
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user:
        print(f"❌ No user found with email: {email}")
        return

    # Get or create credits record
    stmt = select(UserCredits).where(UserCredits.user_id == user.id)
    credits = (await db.execute(stmt)).scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if credits:
        old_balance = credits.credits_balance
        delta = amount - old_balance
        credits.credits_balance = amount
        credits.credits_total_earned = (credits.credits_total_earned or 0) + max(0, delta)
        credits.version += 1
        credits.updated_at = now
        print(f"📝 Updated {user.email}: {old_balance} → {amount} credits (delta: +{delta})")
    else:
        credits = UserCredits(
            id=str(uuid.uuid4()),
            user_id=user.id,
            credits_balance=amount,
            credits_total_earned=amount,
            plan=PlanType.FREE,
            monthly_credits_allowance=50,
            billing_cycle_start=now.date(),
            version=1,
            created_at=now,
            updated_at=now,
        )
        db.add(credits)
        print(f"🆕 Created credit record for {user.email}: {amount} credits")

    # Log the transaction
    txn = CreditTransaction(
        id=str(uuid.uuid4()),
        user_id=user.id,
        amount=amount,
        balance_after=amount,
        transaction_type=TransactionType.ADMIN_ADJUSTMENT,
        operation_type="admin_credit_set",
        status=TransactionStatus.COMPLETED,
        metadata_json={"reason": "admin_setup", "set_to": amount},
        created_at=now,
    )
    db.add(txn)
    await db.commit()
    print(f"✅ Done. {user.email} now has {amount} credits.")


async def ensure_all_users_have_credits(db: AsyncSession):
    """Give 50 credits to any user who has no credit record yet."""
    users = (await db.execute(select(User))).scalars().all()
    created = 0
    for user in users:
        stmt = select(UserCredits).where(UserCredits.user_id == user.id)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            continue
        now = datetime.now(timezone.utc)
        credits = UserCredits(
            id=str(uuid.uuid4()),
            user_id=user.id,
            credits_balance=50,
            credits_total_earned=50,
            plan=PlanType.FREE,
            monthly_credits_allowance=50,
            billing_cycle_start=now.date(),
            version=1,
            created_at=now,
            updated_at=now,
        )
        db.add(credits)
        txn = CreditTransaction(
            id=str(uuid.uuid4()),
            user_id=user.id,
            amount=50,
            balance_after=50,
            transaction_type=TransactionType.BONUS,
            operation_type="signup_grant",
            status=TransactionStatus.COMPLETED,
            metadata_json={"reason": "initial_signup_grant"},
            created_at=now,
        )
        db.add(txn)
        created += 1

    if created:
        await db.commit()
    print(f"✅ Granted 50 credits to {created} existing user(s) who had no credit record.")


async def main(rounak_email: str):
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        print("\n📋 Step 1: Seeding credit_pricing table...")
        await seed_pricing(db)

        print("\n📋 Step 2: Ensuring all existing users have a credit record (50 credits)...")
        await ensure_all_users_have_credits(db)

        print(f"\n📋 Step 3: Assigning 1000 credits to {rounak_email}...")
        await set_user_credits(db, rounak_email, 1000)

    await engine.dispose()
    print("\n🎉 All done!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed credits and assign 1000 to Rounak")
    parser.add_argument(
        "--rounak-email",
        required=True,
        help="Rounak's account email address (e.g. rounak@gmail.com)"
    )
    args = parser.parse_args()
    asyncio.run(main(args.rounak_email))
