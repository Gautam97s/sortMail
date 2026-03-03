"""Add all missing columns to drafts table

Revision ID: e3f6a5b2c8d1
Revises: d2e5f4a1b7c9
Create Date: 2026-03-04 00:57:00.000000

The drafts table was originally created with an older schema via create_all().
Many columns in the current Draft model are missing in production.
This migration adds them all at once using IF NOT EXISTS guard logic.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'e3f6a5b2c8d1'
down_revision: Union[str, None] = 'd2e5f4a1b7c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _add_column_if_missing(table: str, column_name: str, column_def: str) -> None:
    """Add a column only if it doesn't already exist (idempotent)."""
    op.execute(f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = '{table}' AND column_name = '{column_name}'
            ) THEN
                ALTER TABLE {table} ADD COLUMN {column_name} {column_def};
            END IF;
        END$$;
    """)


def upgrade() -> None:
    # Add all potentially missing columns to drafts
    # (already added: subject via d2e5f4a1b7c9)

    _add_column_if_missing('drafts', 'body', 'TEXT')
    _add_column_if_missing('drafts', 'custom_instructions', 'TEXT')
    _add_column_if_missing('drafts', 'generation_model', "VARCHAR DEFAULT ''")
    _add_column_if_missing('drafts', 'tokens_used', 'INTEGER')
    _add_column_if_missing('drafts', 'cost_cents', 'INTEGER')
    _add_column_if_missing('drafts', 'user_edited', 'BOOLEAN DEFAULT FALSE')
    _add_column_if_missing('drafts', 'copied_at', 'TIMESTAMP WITH TIME ZONE')
    _add_column_if_missing('drafts', 'sent_at', 'TIMESTAMP WITH TIME ZONE')
    _add_column_if_missing('drafts', 'feedback_comment', 'TEXT')
    _add_column_if_missing('drafts', 'metadata_json', 'JSONB DEFAULT \'{}\'::jsonb')
    _add_column_if_missing('drafts', 'version', 'INTEGER DEFAULT 0')
    _add_column_if_missing('drafts', 'deleted_at', 'TIMESTAMP WITH TIME ZONE')
    _add_column_if_missing('drafts', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
    _add_column_if_missing('drafts', 'reply_to_email_id', 'VARCHAR')

    # Backfill body for existing rows (NOT NULL in model)
    op.execute("UPDATE drafts SET body = '' WHERE body IS NULL")
    # Backfill generation_model for existing rows
    op.execute("UPDATE drafts SET generation_model = '' WHERE generation_model IS NULL")


def downgrade() -> None:
    # We don't drop these in downgrade as the table might have data
    pass
