"""
Notification Models
-------------------
SQLAlchemy models for notifications and preferences (Module 9).
"""

from datetime import datetime, time
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, Text, Time
from sqlalchemy.dialects.postgresql import JSONB

from core.storage.database import Base
import enum


class NotificationType(str, enum.Enum):
    EMAIL_URGENT = "email_urgent"
    FOLLOW_UP_REMINDER = "follow_up_reminder"
    TASK_DUE = "task_due"
    CREDIT_LOW = "credit_low"
    ACCOUNT_UPDATE = "account_update"
    SYSTEM_ANNOUNCEMENT = "system_announcement"


class NotificationPriority(str, enum.Enum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(100), nullable=True)
    
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(String, nullable=True) # UUID
    
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)
    
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    
    is_dismissed = Column(Boolean, default=False)
    dismissed_at = Column(DateTime, nullable=True)
    
    expires_at = Column(DateTime, nullable=True)
    metadata_json = Column(JSONB, default={})
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        # Indexes managed via migration
    )


class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=False)
    in_app_enabled = Column(Boolean, default=True)
    
    channels = Column(JSONB, default={}) # Per-type prefs
    
    quiet_hours_start = Column(Time, nullable=True)
    quiet_hours_end = Column(Time, nullable=True)
    quiet_hours_timezone = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
