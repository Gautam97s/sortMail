"""Comprehensive schema sync - all tables

Revision ID: f4a7b6c3d2e1
Revises: e3f6a5b2c8d1
Create Date: 2026-03-04 01:10:00.000000

Uses native PostgreSQL ADD COLUMN IF NOT EXISTS (PG 9.6+).
Each statement is atomic and fast — no DO $$ blocks needed.
This migration is fully idempotent — safe to re-run.
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'f4a7b6c3d2e1'
down_revision: Union[str, None] = 'e3f6a5b2c8d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def c(table: str, column: str, ddl: str) -> None:
    """ADD COLUMN IF NOT EXISTS — native PG9.6+ syntax, fast and idempotent."""
    op.execute(f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {ddl}')


def upgrade() -> None:
    # ─────────────── USERS ───────────────
    c('users', 'name', 'VARCHAR')
    c('users', 'picture_url', 'VARCHAR')
    c('users', 'access_token', 'TEXT')
    c('users', 'refresh_token', 'TEXT')
    c('users', 'token_expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('users', 'preferences', "JSONB DEFAULT '{}'::jsonb")
    c('users', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('users', 'status', "VARCHAR DEFAULT 'active'")
    c('users', 'account_type', "VARCHAR DEFAULT 'individual'")
    c('users', 'is_superuser', 'BOOLEAN DEFAULT FALSE')
    c('users', 'workspace_id', 'VARCHAR')
    c('users', 'last_login_at', 'TIMESTAMP WITH TIME ZONE')
    c('users', 'last_login_ip', 'VARCHAR')
    c('users', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('users', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── USER_SESSIONS ───────────────
    c('user_sessions', 'device_fingerprint', 'VARCHAR')
    c('user_sessions', 'is_revoked', 'BOOLEAN DEFAULT FALSE')

    # ─────────────── USER_SECURITY_EVENTS ───────────────
    c('user_security_events', 'device_fingerprint', 'VARCHAR')
    c('user_security_events', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('user_security_events', 'severity', "VARCHAR DEFAULT 'info'")

    # ─────────────── WORKSPACES ───────────────
    c('workspaces', 'slug', "VARCHAR DEFAULT ''")
    c('workspaces', 'plan', "VARCHAR DEFAULT 'team'")
    c('workspaces', 'seat_limit', 'INTEGER DEFAULT 5')
    c('workspaces', 'seats_used', 'INTEGER DEFAULT 1')
    c('workspaces', 'settings', "JSONB DEFAULT '{}'::jsonb")
    c('workspaces', 'billing_email', 'VARCHAR')
    c('workspaces', 'status', "VARCHAR DEFAULT 'active'")
    c('workspaces', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('workspaces', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── THREADS ───────────────
    c('threads', 'participants', "TEXT[]")
    c('threads', 'labels', "TEXT[] DEFAULT '{}'")
    c('threads', 'is_unread', 'INTEGER DEFAULT 0')
    c('threads', 'is_starred', 'BOOLEAN DEFAULT FALSE')
    c('threads', 'has_attachments', 'BOOLEAN DEFAULT FALSE')
    c('threads', 'summary', 'TEXT')
    c('threads', 'intent', 'VARCHAR')
    c('threads', 'urgency_score', 'INTEGER')
    c('threads', 'intel_json', 'JSONB')
    c('threads', 'last_email_at', 'TIMESTAMP WITH TIME ZONE')
    c('threads', 'last_synced_at', 'TIMESTAMP WITH TIME ZONE')
    c('threads', 'intel_generated_at', 'TIMESTAMP WITH TIME ZONE')
    c('threads', 'rag_embedded_at', 'TIMESTAMP WITH TIME ZONE')

    # ─────────────── EMAILS ───────────────
    c('emails', 'sender_name', 'VARCHAR')
    c('emails', 'body_plain', 'TEXT')
    c('emails', 'body_html', 'TEXT')
    c('emails', 'snippet', 'VARCHAR')
    c('emails', 'is_reply', 'BOOLEAN DEFAULT FALSE')
    c('emails', 'is_forward', 'BOOLEAN DEFAULT FALSE')
    c('emails', 'in_reply_to', 'VARCHAR')
    # 'references' is a PostgreSQL reserved word — must be quoted
    op.execute('ALTER TABLE emails ADD COLUMN IF NOT EXISTS "references" TEXT[] DEFAULT \'{}\'')
    c('emails', 'has_attachments', 'BOOLEAN DEFAULT FALSE')
    c('emails', 'attachment_count', 'INTEGER DEFAULT 0')
    c('emails', 'total_attachment_size_bytes', 'BIGINT DEFAULT 0')
    c('emails', 'is_from_user', 'BOOLEAN DEFAULT FALSE')
    c('emails', 'headers', 'JSONB')
    c('emails', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('emails', 'sent_at', 'TIMESTAMP WITH TIME ZONE')
    c('emails', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('emails', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── TASKS ───────────────
    c('tasks', 'workspace_id', 'VARCHAR')
    c('tasks', 'description', 'TEXT')
    c('tasks', 'task_type', "VARCHAR DEFAULT 'general'")
    c('tasks', 'priority_level', 'VARCHAR')
    c('tasks', 'priority_score', 'INTEGER DEFAULT 0')
    c('tasks', 'source_type', "VARCHAR DEFAULT 'user_created'")
    c('tasks', 'source_email_id', 'VARCHAR')
    c('tasks', 'ai_confidence', 'INTEGER')
    c('tasks', 'due_date', 'DATE')
    c('tasks', 'due_time', 'TIMESTAMP WITH TIME ZONE')
    c('tasks', 'reminder_at', 'TIMESTAMP WITH TIME ZONE')
    c('tasks', 'reminder_sent', 'BOOLEAN DEFAULT FALSE')
    c('tasks', 'completed_at', 'TIMESTAMP WITH TIME ZONE')
    c('tasks', 'assigned_to_user_id', 'VARCHAR')
    c('tasks', 'tags', "TEXT[] DEFAULT '{}'")
    c('tasks', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('tasks', 'version', 'INTEGER DEFAULT 0')
    c('tasks', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('tasks', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── CONNECTED_ACCOUNTS ───────────────
    c('connected_accounts', 'error_code', 'VARCHAR')
    c('connected_accounts', 'error_message', 'VARCHAR')
    c('connected_accounts', 'last_sync_at', 'TIMESTAMP WITH TIME ZONE')
    c('connected_accounts', 'last_history_id', 'VARCHAR')
    c('connected_accounts', 'sync_status', "VARCHAR DEFAULT 'idle'")
    c('connected_accounts', 'sync_error', 'VARCHAR')
    c('connected_accounts', 'initial_sync_done', 'BOOLEAN DEFAULT FALSE')
    c('connected_accounts', 'sync_window_days', 'INTEGER DEFAULT 90')
    c('connected_accounts', 'sync_enabled', 'BOOLEAN DEFAULT TRUE')
    c('connected_accounts', 'sync_frequency_minutes', 'INTEGER DEFAULT 15')
    c('connected_accounts', 'last_watch_expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('connected_accounts', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('connected_accounts', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('connected_accounts', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── CONTACTS ───────────────
    c('contacts', 'display_name', 'VARCHAR')
    c('contacts', 'notes', 'TEXT')
    c('contacts', 'is_vip', 'BOOLEAN DEFAULT FALSE')
    c('contacts', 'is_unsubscribed', 'BOOLEAN DEFAULT FALSE')
    c('contacts', 'unsubscribed_at', 'TIMESTAMP WITH TIME ZONE')
    c('contacts', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('contacts', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('contacts', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── TAGS ───────────────
    c('tags', 'description', 'TEXT')
    c('tags', "color", "VARCHAR DEFAULT '#6366f1'")
    c('tags', 'icon', 'VARCHAR')
    c('tags', 'is_system', 'BOOLEAN DEFAULT FALSE')
    c('tags', 'is_ai_generated', 'BOOLEAN DEFAULT FALSE')
    c('tags', 'usage_count', 'INTEGER DEFAULT 0')
    c('tags', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('tags', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── ATTACHMENTS ───────────────
    c('attachments', 'external_id', 'VARCHAR')
    c('attachments', 'filename_sanitized', "VARCHAR DEFAULT ''")
    c('attachments', 'storage_provider', "VARCHAR DEFAULT 's3'")
    c('attachments', 'storage_path', 'TEXT')
    c('attachments', 'storage_bucket', 'VARCHAR')
    c('attachments', 'skip_reason', 'VARCHAR')
    c('attachments', 'extracted_text', 'TEXT')
    c('attachments', 'intel_json', 'JSONB')
    c('attachments', 'extraction_method', 'VARCHAR')
    c('attachments', 'extraction_language', 'VARCHAR')
    c('attachments', 'extraction_confidence', 'FLOAT')
    c('attachments', 'chunk_count', 'INTEGER DEFAULT 0')
    c('attachments', 'virus_scan_result', 'VARCHAR')
    c('attachments', 'virus_scan_details', 'TEXT')
    c('attachments', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('attachments', 'downloaded_at', 'TIMESTAMP WITH TIME ZONE')
    c('attachments', 'processed_at', 'TIMESTAMP WITH TIME ZONE')
    c('attachments', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('attachments', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── NOTIFICATIONS ───────────────
    c('notifications', 'type', "VARCHAR DEFAULT 'info'")
    c('notifications', 'title', 'VARCHAR')
    c('notifications', 'body', 'TEXT')
    c('notifications', 'action_url', 'VARCHAR')
    c('notifications', 'is_read', 'BOOLEAN DEFAULT FALSE')
    c('notifications', 'read_at', 'TIMESTAMP WITH TIME ZONE')
    c('notifications', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('notifications', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('notifications', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── FOLLOW_UPS ───────────────
    c('follow_ups', 'email_id', 'VARCHAR')
    c('follow_ups', 'expected_reply_by', 'TIMESTAMP WITH TIME ZONE')
    c('follow_ups', 'reminder_at', 'TIMESTAMP WITH TIME ZONE')
    c('follow_ups', 'reminder_sent', 'BOOLEAN DEFAULT FALSE')
    c('follow_ups', 'snoozed_until', 'TIMESTAMP WITH TIME ZONE')
    c('follow_ups', 'reply_received_at', 'TIMESTAMP WITH TIME ZONE')
    c('follow_ups', 'auto_detected', 'BOOLEAN DEFAULT FALSE')
    c('follow_ups', 'detection_confidence', 'INTEGER')
    c('follow_ups', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('follow_ups', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('follow_ups', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── EMAIL_RULES ───────────────
    c('email_rules', 'description', 'TEXT')
    c('email_rules', 'priority', 'INTEGER DEFAULT 0')
    c('email_rules', 'match_all_conditions', 'BOOLEAN DEFAULT TRUE')
    c('email_rules', 'apply_to_existing', 'BOOLEAN DEFAULT FALSE')
    c('email_rules', 'times_triggered', 'BIGINT DEFAULT 0')
    c('email_rules', 'last_triggered_at', 'TIMESTAMP WITH TIME ZONE')
    c('email_rules', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── USER_CREDITS ───────────────
    c('user_credits', 'credits_total_earned', 'BIGINT DEFAULT 0')
    c('user_credits', 'credits_total_spent', 'BIGINT DEFAULT 0')
    c('user_credits', 'monthly_credits_allowance', 'INTEGER DEFAULT 50')
    c('user_credits', 'credits_used_this_month', 'INTEGER DEFAULT 0')
    c('user_credits', 'billing_cycle_start', 'DATE DEFAULT CURRENT_DATE')
    c('user_credits', 'credits_expire_at', 'TIMESTAMP WITH TIME ZONE')
    c('user_credits', 'previous_plan', 'VARCHAR')
    c('user_credits', 'plan_changed_at', 'TIMESTAMP WITH TIME ZONE')
    c('user_credits', 'last_operation_at', 'TIMESTAMP WITH TIME ZONE')
    c('user_credits', 'operations_count_last_minute', 'INTEGER DEFAULT 0')
    c('user_credits', 'operations_count_last_hour', 'INTEGER DEFAULT 0')
    c('user_credits', 'balance_updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
    c('user_credits', 'version', 'INTEGER DEFAULT 0')
    c('user_credits', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── CREDIT_TRANSACTIONS ───────────────
    c('credit_transactions', 'operation_type', 'VARCHAR(50)')
    c('credit_transactions', 'related_entity_id', 'VARCHAR')
    c('credit_transactions', 'expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('credit_transactions', 'refunded_transaction_id', 'VARCHAR')
    c('credit_transactions', 'is_refunded', 'BOOLEAN DEFAULT FALSE')
    c('credit_transactions', 'source_user_id', 'VARCHAR')
    c('credit_transactions', 'ip_address', 'VARCHAR(45)')
    c('credit_transactions', 'user_agent', 'TEXT')
    c('credit_transactions', 'is_flagged', 'BOOLEAN DEFAULT FALSE')
    c('credit_transactions', 'flag_reason', 'TEXT')
    c('credit_transactions', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")

    # ─────────────── API_KEYS ───────────────
    c('api_keys', 'rate_limit_per_hour', 'INTEGER DEFAULT 1000')
    c('api_keys', 'last_used_at', 'TIMESTAMP WITH TIME ZONE')
    c('api_keys', 'last_used_ip', 'VARCHAR(45)')
    c('api_keys', 'usage_count', 'BIGINT DEFAULT 0')
    c('api_keys', 'expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('api_keys', 'is_active', 'BOOLEAN DEFAULT TRUE')
    c('api_keys', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── SAVED_SEARCHES ───────────────
    c('saved_searches', 'is_smart_folder', 'BOOLEAN DEFAULT FALSE')
    c('saved_searches', 'notification_enabled', 'BOOLEAN DEFAULT FALSE')
    c('saved_searches', 'last_used_at', 'TIMESTAMP WITH TIME ZONE')
    c('saved_searches', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── INTEGRATIONS ───────────────
    c('integrations', 'workspace_id', 'VARCHAR')
    c('integrations', 'credentials_encrypted', 'TEXT')
    c('integrations', 'last_triggered_at', 'TIMESTAMP WITH TIME ZONE')
    c('integrations', 'trigger_count', 'BIGINT DEFAULT 0')
    c('integrations', 'error_count', 'INTEGER DEFAULT 0')
    c('integrations', 'last_error', 'TEXT')
    c('integrations', 'last_error_at', 'TIMESTAMP WITH TIME ZONE')
    c('integrations', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('integrations', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('integrations', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── GDPR_REQUESTS ───────────────
    c('gdpr_requests', 'export_file_url', 'TEXT')
    c('gdpr_requests', 'export_expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('gdpr_requests', 'deletion_confirmed', 'BOOLEAN DEFAULT FALSE')
    c('gdpr_requests', 'deletion_completed_at', 'TIMESTAMP WITH TIME ZONE')
    c('gdpr_requests', 'admin_notes', 'TEXT')
    c('gdpr_requests', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('gdpr_requests', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── SUBSCRIPTIONS ───────────────
    c('subscriptions', 'workspace_id', 'VARCHAR')
    c('subscriptions', 'cancel_at_period_end', 'BOOLEAN DEFAULT FALSE')
    c('subscriptions', 'canceled_at', 'TIMESTAMP WITH TIME ZONE')
    c('subscriptions', 'trial_start', 'TIMESTAMP WITH TIME ZONE')
    c('subscriptions', 'trial_end', 'TIMESTAMP WITH TIME ZONE')
    c('subscriptions', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('subscriptions', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── ADMIN_USERS ───────────────
    c('admin_users', 'permissions', "TEXT[] DEFAULT '{}'")
    c('admin_users', 'can_impersonate', 'BOOLEAN DEFAULT FALSE')
    c('admin_users', 'can_adjust_credits', 'BOOLEAN DEFAULT FALSE')
    c('admin_users', 'can_view_analytics', 'BOOLEAN DEFAULT FALSE')
    c('admin_users', 'can_manage_users', 'BOOLEAN DEFAULT FALSE')
    c('admin_users', 'can_manage_billing', 'BOOLEAN DEFAULT FALSE')
    c('admin_users', 'last_admin_action_at', 'TIMESTAMP WITH TIME ZONE')
    c('admin_users', 'is_active', 'BOOLEAN DEFAULT TRUE')
    c('admin_users', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── ABUSE_REPORTS ───────────────
    c('abuse_reports', 'assigned_to_admin_id', 'VARCHAR')
    c('abuse_reports', 'resolution_notes', 'TEXT')
    c('abuse_reports', 'resolved_at', 'TIMESTAMP WITH TIME ZONE')
    c('abuse_reports', 'auto_detected', 'BOOLEAN DEFAULT FALSE')
    c('abuse_reports', 'detection_rule', 'VARCHAR(100)')
    c('abuse_reports', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── AI_PROCESSING_QUEUE ───────────────
    c('ai_processing_queue', 'max_attempts', 'INTEGER DEFAULT 3')
    c('ai_processing_queue', 'reserved_at', 'TIMESTAMP WITH TIME ZONE')
    c('ai_processing_queue', 'reserved_by_worker', 'VARCHAR')
    c('ai_processing_queue', 'reservation_expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('ai_processing_queue', 'completed_at', 'TIMESTAMP WITH TIME ZONE')
    c('ai_processing_queue', 'failed_at', 'TIMESTAMP WITH TIME ZONE')
    c('ai_processing_queue', 'error_message', 'TEXT')
    c('ai_processing_queue', 'input_context', 'JSONB')
    c('ai_processing_queue', 'result', 'JSONB')
    c('ai_processing_queue', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('ai_processing_queue', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── AI_USAGE_LOGS ───────────────
    c('ai_usage_logs', 'credits_charged', 'INTEGER')
    c('ai_usage_logs', 'latency_ms', 'INTEGER')
    c('ai_usage_logs', 'cache_hit', 'BOOLEAN DEFAULT FALSE')
    c('ai_usage_logs', 'related_entity_type', 'VARCHAR')
    c('ai_usage_logs', 'related_entity_id', 'VARCHAR')
    c('ai_usage_logs', 'request_id', 'VARCHAR')
    c('ai_usage_logs', 'error_occurred', 'BOOLEAN DEFAULT FALSE')
    c('ai_usage_logs', 'error_type', 'VARCHAR')
    c('ai_usage_logs', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")

    # ─────────────── JOB_QUEUE ───────────────
    c('job_queue', 'reserved_at', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'reserved_by_worker', 'VARCHAR(100)')
    c('job_queue', 'reservation_expires_at', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'started_at', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'completed_at', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'failed_at', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'error_message', 'TEXT')
    c('job_queue', 'scheduled_for', 'TIMESTAMP WITH TIME ZONE')
    c('job_queue', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')

    # ─────────────── CALENDAR_SUGGESTIONS ───────────────
    c('calendar_suggestions', 'event_type', "VARCHAR DEFAULT 'meeting'")
    c('calendar_suggestions', 'description', 'TEXT')
    c('calendar_suggestions', 'suggested_date', 'DATE')
    c('calendar_suggestions', 'suggested_time', 'TIMESTAMP WITH TIME ZONE')
    c('calendar_suggestions', 'suggested_end_time', 'TIMESTAMP WITH TIME ZONE')
    c('calendar_suggestions', 'suggested_timezone', 'VARCHAR')
    c('calendar_suggestions', 'location', 'VARCHAR')
    c('calendar_suggestions', 'participants', "TEXT[] DEFAULT '{}'")
    c('calendar_suggestions', 'is_recurring', 'BOOLEAN DEFAULT FALSE')
    c('calendar_suggestions', 'recurrence_pattern', 'VARCHAR')
    c('calendar_suggestions', 'accepted_at', 'TIMESTAMP WITH TIME ZONE')
    c('calendar_suggestions', 'dismissed_at', 'TIMESTAMP WITH TIME ZONE')
    c('calendar_suggestions', 'external_calendar_event_id', 'VARCHAR')
    c('calendar_suggestions', 'metadata_json', "JSONB DEFAULT '{}'::jsonb")
    c('calendar_suggestions', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    c('calendar_suggestions', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')


def downgrade() -> None:
    pass  # Columns are safe to keep
