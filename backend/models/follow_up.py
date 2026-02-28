"""
Waiting For Model
-----------------
SQLAlchemy model for follow-up tracking.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
import enum

from core.storage.database import Base


class FollowUpStatus(str, enum.Enum):
    WAITING = "waiting"
    REPLIED = "replied"
    SNOOZED = "snoozed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class FollowUp(Base):
    """Track emails waiting for reply."""
    __tablename__ = "follow_ups"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(String, ForeignKey("threads.id"), nullable=False, index=True)
    email_id = Column(String, ForeignKey("emails.id"), nullable=True) # specific message
    
    expected_reply_by = Column(DateTime, nullable=True)
    reminder_at = Column(DateTime, nullable=True)
    reminder_sent = Column(Boolean, default=False)
    
    status = Column(Enum(FollowUpStatus), default=FollowUpStatus.WAITING)
    snoozed_until = Column(DateTime, nullable=True)
    reply_received_at = Column(DateTime, nullable=True)
    
    auto_detected = Column(Boolean, default=False)
    detection_confidence = Column(Integer, nullable=True) # Scaled decimal
    
    metadata_json = Column(JSONB, default={})
    
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('thread_id', 'user_id', 'deleted_at', name='unique_thread_user_followup'),
    )
