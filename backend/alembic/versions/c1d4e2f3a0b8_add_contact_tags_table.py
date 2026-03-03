"""Add contact_tags association table

Revision ID: c1d4e2f3a0b8
Revises: ba4210293b5b
Create Date: 2026-03-04 00:35:00.000000

This migration adds:
  1. contact_tags - many-to-many association between contacts and tags
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d4e2f3a0b8'
down_revision: Union[str, None] = 'ba4210293b5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create contact_tags association table
    op.create_table(
        'contact_tags',
        sa.Column('contact_id', sa.String(), nullable=False),
        sa.Column('tag_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contact_id'], ['contacts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('contact_id', 'tag_id')
    )


def downgrade() -> None:
    op.drop_table('contact_tags')
