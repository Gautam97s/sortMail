"""
Tag Model
---------
SQLAlchemy model for folder-like tags and the many-to-many Thread mapping.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship

from core.storage.database import Base

# Association table for Thread <-> Tag
thread_tags = Table(
    "thread_tags",
    Base.metadata,
    Column("thread_id", String, ForeignKey("threads.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
)

# Association table for Contact <-> Tag
contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_id", String, ForeignKey("contacts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
)


class Tag(Base):
    """Categorization tags for threads (auto or manual)."""
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False, index=True)
    color_hex = Column(String, default="#E2E8F0") # Default gray
    
    is_auto_applied = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    threads = relationship("Thread", secondary=thread_tags, back_populates="tags")
    contacts = relationship("Contact", secondary=contact_tags, back_populates="tags")
