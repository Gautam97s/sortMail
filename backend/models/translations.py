"""
Multi-Language Translation Models
---------------------------------
SQLAlchemy models for UI translations (Module 19).
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, Text, UniqueConstraint

from core.storage.database import Base


class Translation(Base):
    __tablename__ = "translations"

    id = Column(String, primary_key=True)
    key = Column(String(255), nullable=False)
    locale = Column(String(10), nullable=False)
    
    value = Column(Text, nullable=False)
    context = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('key', 'locale', name='uq_translation_key_locale'),
    )
