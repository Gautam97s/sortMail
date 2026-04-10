"""Add user_settings table for AI and privacy preferences

Revision ID: j7d1a2b3c4d5
Revises: h6c9e5f4d2a1
Create Date: 2026-04-10 22:10:00.000000
"""

from typing import Sequence, Union
from alembic import op

revision: str = "j7d1a2b3c4d5"
down_revision: Union[str, None] = "h6c9e5f4d2a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS user_settings (
            id VARCHAR PRIMARY KEY,
            user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
            ai_model VARCHAR NOT NULL DEFAULT 'bedrock-nova',
            ai_tone VARCHAR NOT NULL DEFAULT 'NORMAL',
            ai_auto_draft BOOLEAN NOT NULL DEFAULT FALSE,
            ai_summary_length INTEGER NOT NULL DEFAULT 50,
            privacy_data_retention VARCHAR NOT NULL DEFAULT '1year',
            privacy_email_tracking BOOLEAN NOT NULL DEFAULT FALSE,
            privacy_read_receipts BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """
    )

    op.execute("CREATE INDEX IF NOT EXISTS ix_user_settings_user_id ON user_settings (user_id)")

    # Backfill defaults for existing users so preferences exist immediately.
    op.execute(
        """
        INSERT INTO user_settings (
            id,
            user_id,
            ai_model,
            ai_tone,
            ai_auto_draft,
            ai_summary_length,
            privacy_data_retention,
            privacy_email_tracking,
            privacy_read_receipts,
            created_at,
            updated_at
        )
        SELECT
            'settings-' || u.id,
            u.id,
            'bedrock-nova',
            'NORMAL',
            FALSE,
            50,
            '1year',
            FALSE,
            TRUE,
            NOW(),
            NOW()
        FROM users u
        LEFT JOIN user_settings us ON us.user_id = u.id
        WHERE us.user_id IS NULL
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_settings")
