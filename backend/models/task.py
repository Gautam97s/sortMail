"""
Task Model
----------
SQLAlchemy model for tasks table.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Enum, Boolean, Date
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
import enum

from core.storage.database import Base


class TaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DISMISSED = "DISMISSED"


class TaskType(str, enum.Enum):
    REPLY = "REPLY"
    REVIEW = "REVIEW"
    SCHEDULE = "SCHEDULE"
    FOLLOWUP = "FOLLOWUP"


class PriorityLevel(str, enum.Enum):
    DO_NOW = "DO_NOW"
    DO_TODAY = "DO_TODAY"
    CAN_WAIT = "CAN_WAIT"


class EffortLevel(str, enum.Enum):
    QUICK = "QUICK"
    DEEP_WORK = "DEEP_WORK"


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    source_thread_id = Column(String, ForeignKey("threads.id"), nullable=True, index=True)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=True) # Future team tasks
    
    # Task details
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(PG_ENUM(TaskStatus, name="TASKSTATUS", create_type=False), default=TaskStatus.PENDING, nullable=False)
    task_type = Column(PG_ENUM(TaskType, name="TASKTYPE", create_type=False), default=TaskType.REPLY, nullable=False)
    
    # Priority
    priority_level = Column(String, nullable=True) # urgent, high, medium, low
    priority_score = Column(Integer, default=0)
    
    # Source
    source_type = Column(String, default="USER_CREATED") # ai_generated, user_created, email_converted
    source_email_id = Column(String, ForeignKey("emails.id"), nullable=True)
    ai_confidence = Column(Integer, nullable=True) # Scaled decimal
    
    # Scheduling
    due_date = Column(Date, nullable=True)
    due_time = Column(DateTime(timezone=True), nullable=True) # Time object or DateTime
    reminder_at = Column(DateTime(timezone=True), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    assigned_to_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    tags = Column(ARRAY(String), default=list)
    metadata_json = Column(JSONB, default=dict)
    
    version = Column(Integer, default=0)
    
    # Timestamps
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        # Indexes are managed via migration mainly
    )
