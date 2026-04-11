"""Create follow_ups table and FollowUpStatus enum.

Revision ID: followup_001
Revises: <latest_revision>
Create Date: 2026-04-11 00:00:00.000000

This migration:
1. Creates the FollowUpStatus enum type (WAITING, REPLIED, SNOOZED, CANCELLED, OVERDUE)
2. Creates the follow_ups table with all required columns and indexes
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'followup_001'
down_revision = 'j7d1a2b3c4d5'
branch_labels = None
depends_on = None


def upgrade():
    # Create follow_ups table
    op.create_table(
        'follow_ups',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('thread_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('last_sent_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('days_waiting', sa.Integer(), nullable=True),
        sa.Column('reminded', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('email_id', sa.String(), nullable=True),
        sa.Column('expected_reply_by', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reminder_sent', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='WAITING'),
        sa.Column('snoozed_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reply_received_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('auto_detected', sa.Boolean(), nullable=True, server_default=sa.false()),
        sa.Column('detection_confidence', sa.Integer(), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['thread_id'], ['threads.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_follow_ups_user_id', 'follow_ups', ['user_id'])
    op.create_index('idx_follow_ups_thread_id', 'follow_ups', ['thread_id'])
    op.create_index('idx_follow_ups_status', 'follow_ups', ['status'])
    op.create_index('idx_follow_ups_user_status', 'follow_ups', ['user_id', 'status'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_follow_ups_user_status', table_name='follow_ups')
    op.drop_index('idx_follow_ups_status', table_name='follow_ups')
    op.drop_index('idx_follow_ups_thread_id', table_name='follow_ups')
    op.drop_index('idx_follow_ups_user_id', table_name='follow_ups')
    
    # Drop table
    op.drop_table('follow_ups')
    
    # No enum type to drop because status is stored as VARCHAR.
