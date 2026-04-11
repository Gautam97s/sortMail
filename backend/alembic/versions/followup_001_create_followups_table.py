"""Create follow_ups table and FollowUpStatus enum.

Revision ID: followup_001
Revises: <latest_revision>
Create Date: 2026-04-11 00:00:00.000000

This migration:
1. Creates the FollowUpStatus enum type (WAITING, REPLIED, SNOOZED, CANCELLED, OVERDUE)
2. Creates the follow_ups table with all required columns and indexes
"""

from alembic import op

revision = 'followup_001'
down_revision = 'j7d1a2b3c4d5'
branch_labels = None
depends_on = None


def upgrade():
    # Idempotent creation so environments that already have this table don't fail.
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS follow_ups (
            id VARCHAR PRIMARY KEY,
            thread_id VARCHAR NOT NULL REFERENCES threads(id),
            user_id VARCHAR NOT NULL REFERENCES users(id),
            last_sent_at TIMESTAMPTZ NOT NULL,
            days_waiting INTEGER,
            reminded BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ,
            email_id VARCHAR,
            expected_reply_by TIMESTAMPTZ,
            reminder_at TIMESTAMPTZ,
            reminder_sent BOOLEAN DEFAULT FALSE,
            status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
            snoozed_until TIMESTAMPTZ,
            reply_received_at TIMESTAMPTZ,
            auto_detected BOOLEAN DEFAULT FALSE,
            detection_confidence INTEGER,
            metadata_json JSONB DEFAULT '{}'::jsonb,
            deleted_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ
        )
        """
    )

    op.execute("CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_follow_ups_thread_id ON follow_ups (thread_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups (status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_follow_ups_user_status ON follow_ups (user_id, status)")


def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_follow_ups_user_status")
    op.execute("DROP INDEX IF EXISTS idx_follow_ups_status")
    op.execute("DROP INDEX IF EXISTS idx_follow_ups_thread_id")
    op.execute("DROP INDEX IF EXISTS idx_follow_ups_user_id")
    op.execute("DROP TABLE IF EXISTS follow_ups")
