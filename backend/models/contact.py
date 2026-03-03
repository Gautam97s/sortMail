"""
Contact Model
-------------
SQLAlchemy model for user contacts to support CRM features.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from core.storage.database import Base
from models.tag import contact_tags

class Contact(Base):
    """A lightweight CRM model to track user interactions."""
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    email_address = Column(String, nullable=False, index=True)
    name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    
    interaction_count = Column(Integer, default=1)
    last_interaction_at = Column(DateTime(timezone=True), nullable=True)
    
    # User preferences
    is_unsubscribed = Column(Boolean, default=False, index=True)
    is_vip = Column(Boolean, default=False)
    
    metadata_json = Column(JSONB, default=dict)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    tags = relationship("Tag", secondary=contact_tags, back_populates="contacts")
    
    __table_args__ = (
        # Ex: UniqueConstraint("user_id", "email_address")
    )
