"""
Email Model
-----------
SQLAlchemy model for raw email storage (if needed).
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

from core.storage.database import Base


class Email(Base):
    """Individual email message (separate from Thread/Message if needed)."""
    __tablename__ = "emails"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(String, ForeignKey("threads.id"), nullable=False, index=True)
    
    # Email data
    # Email data
    external_id = Column(String, nullable=False, index=True)  # Provider's message ID
    sender = Column(String, nullable=False, index=True)
    sender_name = Column(String, nullable=True)
    recipients = Column(JSONB, nullable=False) # array of {email, name, type}
    
    subject = Column(String, nullable=False)
    body_plain = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    snippet = Column(String, nullable=True)
    
    # Metadata
    is_reply = Column(Boolean, default=False)
    is_forward = Column(Boolean, default=False)
    in_reply_to = Column(String, nullable=True)
    references = Column(ARRAY(String), default=[])
    
    has_attachments = Column(Boolean, default=False)
    attachment_count = Column(Integer, default=0)
    total_attachment_size_bytes = Column(Integer, default=0) # Using Integer for BigInt if sufficient, or BigInteger
    
    is_from_user = Column(Boolean, default=False)
    headers = Column(JSONB, nullable=True)
    metadata_json = Column(JSONB, default={})
    
    # Timestamps
    received_at = Column(DateTime, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
