"""Add subject column to drafts table

Revision ID: d2e5f4a1b7c9
Revises: c1d4e2f3a0b8
Create Date: 2026-03-04 00:54:00.000000

The Draft model has a `subject` column but the production DB was created
before it was added. This migration backfills it.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd2e5f4a1b7c9'
down_revision: Union[str, None] = 'c1d4e2f3a0b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add subject column, nullable first so it doesn't break existing rows
    op.add_column(
        'drafts',
        sa.Column('subject', sa.String(), nullable=True)
    )
    # Backfill existing rows with an empty string
    op.execute("UPDATE drafts SET subject = '' WHERE subject IS NULL")
    # Now make it NOT NULL to match the model
    op.alter_column('drafts', 'subject', nullable=False)


def downgrade() -> None:
    op.drop_column('drafts', 'subject')
