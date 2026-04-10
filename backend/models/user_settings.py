"""
User Settings Model
-------------------
Per-user persisted settings for AI and privacy preferences.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey

from core.storage.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # AI preferences
    ai_model = Column(String, nullable=False, default="bedrock-nova")
    ai_tone = Column(String, nullable=False, default="NORMAL")
    ai_auto_draft = Column(Boolean, nullable=False, default=False)
    ai_summary_length = Column(Integer, nullable=False, default=50)

    # Privacy preferences
    privacy_data_retention = Column(String, nullable=False, default="1year")
    privacy_email_tracking = Column(Boolean, nullable=False, default=False)
    privacy_read_receipts = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
