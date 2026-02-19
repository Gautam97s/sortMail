"""
Search & Indexing Models
------------------------
SQLAlchemy models for search queries and saved searches (Module 17).
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import JSONB

from core.storage.database import Base
import enum


class SearchType(str, enum.Enum):
    KEYWORD = "keyword"
    SEMANTIC = "semantic"
    FILTER = "filter"


class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    query_text = Column(Text, nullable=False)
    search_type = Column(Enum(SearchType), default=SearchType.KEYWORD)
    filters_applied = Column(JSONB, default={})
    
    results_count = Column(Integer, nullable=False)
    clicked_result_id = Column(String, nullable=True) # UUID
    latency_ms = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    query_text = Column(Text, nullable=False)
    filters = Column(JSONB, default={})
    
    is_smart_folder = Column(Boolean, default=False)
    notification_enabled = Column(Boolean, default=False)
    
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        # Indexes managed via migration
    )
