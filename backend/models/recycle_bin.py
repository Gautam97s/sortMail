"""
Recycle Bin Model
-----------------
Tracks soft-deleted records for restore and timed hard purge.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from core.storage.database import Base


class RecycleBinItem(Base):
    __tablename__ = "recycle_bin_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    entity_type = Column(String, nullable=False, index=True)  # thread | task | draft | workflow_reminder
    entity_id = Column(String, nullable=False, index=True)
    entity_label = Column(String, nullable=True)

    payload_json = Column(JSONB, default=dict)

    deleted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    restore_until = Column(DateTime(timezone=True), nullable=False, index=True)
    restored_at = Column(DateTime(timezone=True), nullable=True)
    purged_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
