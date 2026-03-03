"""
Schema sync v2 — skips core original tables (threads, emails, tasks)
which were created with create_all() and already have all columns.
Only touches newer/extended tables that are more likely to be out of sync.

Run as: python scripts/schema_sync.py
"""
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

conn = psycopg2.connect(url)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
cur.execute("SET statement_timeout = 0")
cur.execute("SET lock_timeout = '5s'")  # Don't wait >5s for a lock; skip instead

# Tables that are ORIGINAL (created with create_all from day 1) — SKIP:
# threads, emails, tasks, drafts, users, connected_accounts
# (already handled by individual migrations or original create_all)

COLUMNS = [
    # ── CONTACTS (from migration ba4210293b5b — might be missing newer cols) ──
    ("contacts", "display_name", "VARCHAR"),
    ("contacts", "notes", "TEXT"),
    ("contacts", "is_vip", "BOOLEAN DEFAULT FALSE"),
    ("contacts", "is_unsubscribed", "BOOLEAN DEFAULT FALSE"),
    ("contacts", "unsubscribed_at", "TIMESTAMP WITH TIME ZONE"),
    ("contacts", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("contacts", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("contacts", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── TAGS ──
    ("tags", "description", "TEXT"),
    ("tags", "color", "VARCHAR DEFAULT '#6366f1'"),
    ("tags", "icon", "VARCHAR"),
    ("tags", "is_system", "BOOLEAN DEFAULT FALSE"),
    ("tags", "is_ai_generated", "BOOLEAN DEFAULT FALSE"),
    ("tags", "usage_count", "INTEGER DEFAULT 0"),
    ("tags", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("tags", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── USER_CREDITS ──
    ("user_credits", "credits_total_earned", "BIGINT DEFAULT 0"),
    ("user_credits", "credits_total_spent", "BIGINT DEFAULT 0"),
    ("user_credits", "monthly_credits_allowance", "INTEGER DEFAULT 50"),
    ("user_credits", "credits_used_this_month", "INTEGER DEFAULT 0"),
    ("user_credits", "billing_cycle_start", "DATE DEFAULT CURRENT_DATE"),
    ("user_credits", "credits_expire_at", "TIMESTAMP WITH TIME ZONE"),
    ("user_credits", "previous_plan", "VARCHAR"),
    ("user_credits", "plan_changed_at", "TIMESTAMP WITH TIME ZONE"),
    ("user_credits", "last_operation_at", "TIMESTAMP WITH TIME ZONE"),
    ("user_credits", "operations_count_last_minute", "INTEGER DEFAULT 0"),
    ("user_credits", "operations_count_last_hour", "INTEGER DEFAULT 0"),
    ("user_credits", "balance_updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),
    ("user_credits", "version", "INTEGER DEFAULT 0"),
    ("user_credits", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── CREDIT_TRANSACTIONS ──
    ("credit_transactions", "operation_type", "VARCHAR(50)"),
    ("credit_transactions", "related_entity_id", "VARCHAR"),
    ("credit_transactions", "expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("credit_transactions", "refunded_transaction_id", "VARCHAR"),
    ("credit_transactions", "is_refunded", "BOOLEAN DEFAULT FALSE"),
    ("credit_transactions", "source_user_id", "VARCHAR"),
    ("credit_transactions", "ip_address", "VARCHAR(45)"),
    ("credit_transactions", "user_agent", "TEXT"),
    ("credit_transactions", "is_flagged", "BOOLEAN DEFAULT FALSE"),
    ("credit_transactions", "flag_reason", "TEXT"),
    ("credit_transactions", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),

    # ── SUBSCRIPTIONS ──
    ("subscriptions", "workspace_id", "VARCHAR"),
    ("subscriptions", "cancel_at_period_end", "BOOLEAN DEFAULT FALSE"),
    ("subscriptions", "canceled_at", "TIMESTAMP WITH TIME ZONE"),
    ("subscriptions", "trial_start", "TIMESTAMP WITH TIME ZONE"),
    ("subscriptions", "trial_end", "TIMESTAMP WITH TIME ZONE"),
    ("subscriptions", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("subscriptions", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── CONNECTED_ACCOUNTS (newer sync fields) ──
    ("connected_accounts", "error_code", "VARCHAR"),
    ("connected_accounts", "error_message", "VARCHAR"),
    ("connected_accounts", "sync_error", "VARCHAR"),
    ("connected_accounts", "initial_sync_done", "BOOLEAN DEFAULT FALSE"),
    ("connected_accounts", "sync_window_days", "INTEGER DEFAULT 90"),
    ("connected_accounts", "sync_enabled", "BOOLEAN DEFAULT TRUE"),
    ("connected_accounts", "sync_frequency_minutes", "INTEGER DEFAULT 15"),
    ("connected_accounts", "last_watch_expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("connected_accounts", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("connected_accounts", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("connected_accounts", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── EMAIL_RULES ──
    ("email_rules", "description", "TEXT"),
    ("email_rules", "priority", "INTEGER DEFAULT 0"),
    ("email_rules", "match_all_conditions", "BOOLEAN DEFAULT TRUE"),
    ("email_rules", "apply_to_existing", "BOOLEAN DEFAULT FALSE"),
    ("email_rules", "times_triggered", "BIGINT DEFAULT 0"),
    ("email_rules", "last_triggered_at", "TIMESTAMP WITH TIME ZONE"),
    ("email_rules", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── FOLLOW_UPS ──
    ("follow_ups", "email_id", "VARCHAR"),
    ("follow_ups", "expected_reply_by", "TIMESTAMP WITH TIME ZONE"),
    ("follow_ups", "reminder_at", "TIMESTAMP WITH TIME ZONE"),
    ("follow_ups", "reminder_sent", "BOOLEAN DEFAULT FALSE"),
    ("follow_ups", "snoozed_until", "TIMESTAMP WITH TIME ZONE"),
    ("follow_ups", "reply_received_at", "TIMESTAMP WITH TIME ZONE"),
    ("follow_ups", "auto_detected", "BOOLEAN DEFAULT FALSE"),
    ("follow_ups", "detection_confidence", "INTEGER"),
    ("follow_ups", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("follow_ups", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("follow_ups", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── SAVED_SEARCHES ──
    ("saved_searches", "is_smart_folder", "BOOLEAN DEFAULT FALSE"),
    ("saved_searches", "notification_enabled", "BOOLEAN DEFAULT FALSE"),
    ("saved_searches", "last_used_at", "TIMESTAMP WITH TIME ZONE"),
    ("saved_searches", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── INTEGRATIONS ──
    ("integrations", "workspace_id", "VARCHAR"),
    ("integrations", "credentials_encrypted", "TEXT"),
    ("integrations", "last_triggered_at", "TIMESTAMP WITH TIME ZONE"),
    ("integrations", "trigger_count", "BIGINT DEFAULT 0"),
    ("integrations", "error_count", "INTEGER DEFAULT 0"),
    ("integrations", "last_error", "TEXT"),
    ("integrations", "last_error_at", "TIMESTAMP WITH TIME ZONE"),
    ("integrations", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("integrations", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("integrations", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── API_KEYS ──
    ("api_keys", "rate_limit_per_hour", "INTEGER DEFAULT 1000"),
    ("api_keys", "last_used_at", "TIMESTAMP WITH TIME ZONE"),
    ("api_keys", "last_used_ip", "VARCHAR(45)"),
    ("api_keys", "usage_count", "BIGINT DEFAULT 0"),
    ("api_keys", "expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("api_keys", "is_active", "BOOLEAN DEFAULT TRUE"),
    ("api_keys", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── AI_PROCESSING_QUEUE ──
    ("ai_processing_queue", "max_attempts", "INTEGER DEFAULT 3"),
    ("ai_processing_queue", "reserved_at", "TIMESTAMP WITH TIME ZONE"),
    ("ai_processing_queue", "reserved_by_worker", "VARCHAR"),
    ("ai_processing_queue", "reservation_expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("ai_processing_queue", "completed_at", "TIMESTAMP WITH TIME ZONE"),
    ("ai_processing_queue", "failed_at", "TIMESTAMP WITH TIME ZONE"),
    ("ai_processing_queue", "error_message", "TEXT"),
    ("ai_processing_queue", "input_context", "JSONB"),
    ("ai_processing_queue", "result", "JSONB"),
    ("ai_processing_queue", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("ai_processing_queue", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── AI_USAGE_LOGS ──
    ("ai_usage_logs", "credits_charged", "INTEGER"),
    ("ai_usage_logs", "latency_ms", "INTEGER"),
    ("ai_usage_logs", "cache_hit", "BOOLEAN DEFAULT FALSE"),
    ("ai_usage_logs", "related_entity_type", "VARCHAR"),
    ("ai_usage_logs", "related_entity_id", "VARCHAR"),
    ("ai_usage_logs", "request_id", "VARCHAR"),
    ("ai_usage_logs", "error_occurred", "BOOLEAN DEFAULT FALSE"),
    ("ai_usage_logs", "error_type", "VARCHAR"),
    ("ai_usage_logs", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),

    # ── JOB_QUEUE ──
    ("job_queue", "reserved_at", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "reserved_by_worker", "VARCHAR(100)"),
    ("job_queue", "reservation_expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "started_at", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "completed_at", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "failed_at", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "error_message", "TEXT"),
    ("job_queue", "scheduled_for", "TIMESTAMP WITH TIME ZONE"),
    ("job_queue", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── CALENDAR_SUGGESTIONS ──
    ("calendar_suggestions", "event_type", "VARCHAR DEFAULT 'meeting'"),
    ("calendar_suggestions", "description", "TEXT"),
    ("calendar_suggestions", "suggested_date", "DATE"),
    ("calendar_suggestions", "suggested_time", "TIMESTAMP WITH TIME ZONE"),
    ("calendar_suggestions", "suggested_end_time", "TIMESTAMP WITH TIME ZONE"),
    ("calendar_suggestions", "suggested_timezone", "VARCHAR"),
    ("calendar_suggestions", "location", "VARCHAR"),
    ("calendar_suggestions", "participants", "TEXT[] DEFAULT '{}'"),
    ("calendar_suggestions", "is_recurring", "BOOLEAN DEFAULT FALSE"),
    ("calendar_suggestions", "recurrence_pattern", "VARCHAR"),
    ("calendar_suggestions", "accepted_at", "TIMESTAMP WITH TIME ZONE"),
    ("calendar_suggestions", "dismissed_at", "TIMESTAMP WITH TIME ZONE"),
    ("calendar_suggestions", "external_calendar_event_id", "VARCHAR"),
    ("calendar_suggestions", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("calendar_suggestions", "deleted_at", "TIMESTAMP WITH TIME ZONE"),
    ("calendar_suggestions", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── GDPR_REQUESTS ──
    ("gdpr_requests", "export_file_url", "TEXT"),
    ("gdpr_requests", "export_expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("gdpr_requests", "deletion_confirmed", "BOOLEAN DEFAULT FALSE"),
    ("gdpr_requests", "deletion_completed_at", "TIMESTAMP WITH TIME ZONE"),
    ("gdpr_requests", "admin_notes", "TEXT"),
    ("gdpr_requests", "metadata_json", "JSONB DEFAULT '{}'::jsonb"),
    ("gdpr_requests", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),

    # ── ADMIN_USERS ──
    ("admin_users", "permissions", "TEXT[] DEFAULT '{}'"),
    ("admin_users", "can_impersonate", "BOOLEAN DEFAULT FALSE"),
    ("admin_users", "can_adjust_credits", "BOOLEAN DEFAULT FALSE"),
    ("admin_users", "can_view_analytics", "BOOLEAN DEFAULT FALSE"),
    ("admin_users", "can_manage_users", "BOOLEAN DEFAULT FALSE"),
    ("admin_users", "can_manage_billing", "BOOLEAN DEFAULT FALSE"),
    ("admin_users", "last_admin_action_at", "TIMESTAMP WITH TIME ZONE"),
    ("admin_users", "is_active", "BOOLEAN DEFAULT TRUE"),
    ("admin_users", "updated_at", "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"),
]


def table_exists(table_name: str) -> bool:
    cur.execute(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name=%s AND table_schema='public')",
        (table_name.strip('"'),)
    )
    return cur.fetchone()[0]


total = len(COLUMNS)
done = 0
skipped_table = 0
errors = 0
lock_skipped = 0

print(f"Processing {total} columns across extended tables...\n")

for table, column, ddl in COLUMNS:
    bare = table.strip('"')
    if not table_exists(bare):
        print(f"  SKIP  {table} (table doesn't exist yet)")
        skipped_table += 1
        continue
    sql = f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {ddl}"
    try:
        cur.execute(sql)
        print(f"  OK    {table}.{column}")
        done += 1
    except psycopg2.errors.LockNotAvailable:
        print(f"  LOCK  {table}.{column} (lock timeout — table busy, skip)")
        lock_skipped += 1
        conn.rollback()
    except Exception as e:
        err = str(e).split('\n')[0]
        print(f"  ERR   {table}.{column}: {err}")
        errors += 1

cur.close()
conn.close()

print(f"\n{'='*50}")
print(f"Done. {done} OK | {lock_skipped} lock-skipped | {skipped_table} tables missing | {errors} errors")
print("Re-run the script to retry any lock-skipped columns.")
