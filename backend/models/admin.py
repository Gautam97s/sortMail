"""
Admin & Moderation Models
-------------------------
SQLAlchemy models for admin users, audit logs, and abuse reports (Module 12).
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

from core.storage.database import Base
import enum


class AdminRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    SUPPORT = "SUPPORT"
    READONLY = "READONLY"


class AdminActionType(str, enum.Enum):
    USER_SUSPENDED = "USER_SUSPENDED"
    USER_UNSUSPENDED = "USER_UNSUSPENDED"
    CREDITS_ADJUSTED = "CREDITS_ADJUSTED"
    USER_DELETED = "USER_DELETED"
    IMPERSONATION_STARTED = "IMPERSONATION_STARTED"
    IMPERSONATION_ENDED = "IMPERSONATION_ENDED"
    SETTINGS_CHANGED = "SETTINGS_CHANGED"
    DATA_EXPORTED = "DATA_EXPORTED"


class AbuseReportType(str, enum.Enum):
    SPAM = "SPAM"
    CREDIT_ABUSE = "CREDIT_ABUSE"
    API_ABUSE = "API_ABUSE"
    TOS_VIOLATION = "TOS_VIOLATION"
    PAYMENT_FRAUD = "PAYMENT_FRAUD"
    OTHER = "OTHER"


class AbuseReportSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AbuseReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    role = Column(Enum(AdminRole), default=AdminRole.READONLY, nullable=False)
    permissions = Column(ARRAY(String), default=list)
    
    can_impersonate = Column(Boolean, default=False)
    can_adjust_credits = Column(Boolean, default=False)
    can_view_analytics = Column(Boolean, default=False)
    can_manage_users = Column(Boolean, default=False)
    can_manage_billing = Column(Boolean, default=False)
    
    last_admin_action_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_user_id = Column(String, ForeignKey("admin_users.id"), nullable=False, index=True)
    
    action_type = Column(Enum(AdminActionType), nullable=False)
    target_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    
    action_details = Column(Text, nullable=False)
    before_state = Column(JSONB, nullable=True)
    after_state = Column(JSONB, nullable=True)
    
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AbuseReport(Base):
    __tablename__ = "abuse_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    reported_user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    report_type = Column(Enum(AbuseReportType), nullable=False)
    severity = Column(Enum(AbuseReportSeverity), default=AbuseReportSeverity.LOW, nullable=False)
    
    description = Column(Text, nullable=False)
    evidence = Column(JSONB, default=dict)
    
    status = Column(Enum(AbuseReportStatus), default=AbuseReportStatus.PENDING, nullable=False)
    assigned_to_admin_id = Column(String, ForeignKey("admin_users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    auto_detected = Column(Boolean, default=False)
    detection_rule = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
