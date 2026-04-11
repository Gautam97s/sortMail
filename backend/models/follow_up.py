"""
Waiting For Model
-----------------
SQLAlchemy model for follow-up tracking.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
import enum

from core.storage.database import Base


class FollowUpStatus(str, enum.Enum):
    WAITING = "WAITING"
    REPLIED = "REPLIED"
    SNOOZED = "SNOOZED"
    CANCELLED = "CANCELLED"
    OVERDUE = "OVERDUE"


class FollowUp(Base):
    """Track emails waiting for reply."""
    __tablename__ = "follow_ups"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(String, ForeignKey("threads.id"), nullable=False, index=True)
    email_id = Column(String, ForeignKey("emails.id"), nullable=True) # specific message

    # Backward-compatible fields already present in production schema.
    last_sent_at = Column(DateTime(timezone=True), nullable=False)
    days_waiting = Column(Integer, nullable=True)
    reminded = Column(Boolean, default=False)
    
    expected_reply_by = Column(DateTime(timezone=True), nullable=True)
    reminder_at = Column(DateTime(timezone=True), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    
    status = Column(SQLEnum(FollowUpStatus, native_enum=False), default=FollowUpStatus.WAITING, nullable=False)
    snoozed_until = Column(DateTime(timezone=True), nullable=True)
    reply_received_at = Column(DateTime(timezone=True), nullable=True)
    
    auto_detected = Column(Boolean, default=False)
    detection_confidence = Column(Integer, nullable=True) # Scaled decimal
    
    metadata_json = Column(JSONB, default=dict)
    
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        UniqueConstraint('thread_id', 'user_id', 'deleted_at', name='unique_thread_user_followup'),
    )
