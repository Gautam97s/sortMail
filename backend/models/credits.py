"""
Credit System Models
--------------------
SQLAlchemy models for the Credit System (Module 8).
Matches Production Grade Schema.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, BigInteger, UniqueConstraint, Date, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship

from core.storage.database import Base
import enum

# --- Enums ---

class PlanType(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    TEAM = "TEAM"
    ENTERPRISE = "ENTERPRISE"

class TransactionType(str, enum.Enum):
    MONTHLY_ALLOWANCE = "MONTHLY_ALLOWANCE"
    PURCHASE = "PURCHASE"
    BONUS = "BONUS"
    REFUND = "REFUND"
    DEDUCTION = "DEDUCTION"
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"
    EXPIRY = "EXPIRY"

class TransactionStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    RESERVED = "RESERVED"
    CANCELLED = "CANCELLED"


# --- Models ---

class UserCredits(Base):
    __tablename__ = "user_credits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4())) # UUID
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Balances
    credits_balance = Column(BigInteger, default=0, nullable=False)
    credits_total_earned = Column(BigInteger, default=0)
    credits_total_spent = Column(BigInteger, default=0)
    
    # Plan Info
    plan = Column(Enum(PlanType), default=PlanType.FREE, nullable=False)
    monthly_credits_allowance = Column(BigInteger, default=2_000_000, nullable=False)
    credits_used_this_month = Column(BigInteger, default=0)
    billing_cycle_start = Column(Date, nullable=False)
    
    # Expiry & versioning
    credits_expire_at = Column(DateTime(timezone=True), nullable=True)
    previous_plan = Column(Enum(PlanType), nullable=True)
    plan_changed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Rate Limiting
    last_operation_at = Column(DateTime(timezone=True), nullable=True)
    operations_count_last_minute = Column(Integer, default=0)
    operations_count_last_hour = Column(Integer, default=0)
    
    # Metadata
    balance_updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    version = Column(Integer, default=0) # Optimistic Locking
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        # Indexes managed via migration
    )


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    amount = Column(BigInteger, nullable=False) # + or - (milli-credits)
    balance_after = Column(BigInteger, nullable=False)
    
    transaction_type = Column(Enum(TransactionType), nullable=False)
    operation_type = Column(String(50), nullable=True)
    related_entity_id = Column(String, nullable=True) # UUID
    
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True) # For reservations
    
    # Refund tracking
    refunded_transaction_id = Column(String, ForeignKey("credit_transactions.id"), nullable=True)
    is_refunded = Column(Boolean, default=False)
    
    # Audit
    source_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Fraud
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(Text, nullable=True)
    
    metadata_json = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CreditPricing(Base):
    __tablename__ = "credit_pricing"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    operation_type = Column(String(100), unique=True, nullable=False)
    credits_cost = Column(BigInteger, nullable=False)
    
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    
    effective_from = Column(Date, nullable=False)
    effective_until = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CreditPackage(Base):
    __tablename__ = "credit_packages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    credits_amount = Column(Integer, nullable=False)
    price_cents = Column(Integer, nullable=False)
    bonus_percentage = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    
    valid_from = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class UserCreditLimits(Base):
    __tablename__ = "user_credit_limits"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    max_credits_per_day = Column(BigInteger, nullable=True)
    max_credits_per_operation = Column(BigInteger, nullable=True)
    allowed_operations = Column(ARRAY(String), nullable=True)
    blocked_operations = Column(ARRAY(String), nullable=True)
    
    reason = Column(Text, nullable=True)
    set_by_admin_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CreditUsageDaily(Base):
    __tablename__ = "credit_usage_daily"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(Date, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    operation_type = Column(String, nullable=False)
    
    credits_used = Column(BigInteger, default=0)
    operations_count = Column(Integer, default=0)
    actual_cost_cents = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        UniqueConstraint('date', 'user_id', 'operation_type', name='uq_daily_usage'),
    )
