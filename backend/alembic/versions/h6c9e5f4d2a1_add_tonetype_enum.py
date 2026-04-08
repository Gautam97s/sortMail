"""Add TONETYPE enum and fix tone column in drafts table

Revision ID: h6c9e5f4d2a1
Revises: g5b8c7d4e3f2
Create Date: 2026-04-08 15:58:00.000000

The TONETYPE enum is referenced by the drafts table but was never created in the database.
This migration creates it and ensures the tone column is properly typed.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'h6c9e5f4d2a1'
down_revision: Union[str, None] = 'g5b8c7d4e3f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create TONETYPE enum with valid values
    sa.Enum('BRIEF', 'NORMAL', 'FORMAL', name='TONETYPE').create(op.get_bind(), checkfirst=True)
    
    # Ensure tone column exists and is properly typed as the enum
    # First check if tone column exists, if not add it
    op.execute("""
        DO $$
        BEGIN
            -- Try to add the tone column with enum type if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'drafts' AND column_name = 'tone'
            ) THEN
                ALTER TABLE drafts ADD COLUMN tone VARCHAR DEFAULT 'NORMAL';
            END IF;
        END$$;
    """)
    
    # Ensure tone values are uppercase (handle case where they might be lowercase)
    op.execute("UPDATE drafts SET tone = UPPER(tone::text)::"TONETYPE" WHERE tone IS NOT NULL AND tone::text != UPPER(tone::text)")
    
    # Now alter the column to use the proper enum type
    # Drop the old constraint if it exists and recreate with proper type
    try:
        op.execute("""
            ALTER TABLE drafts 
            ALTER COLUMN tone TYPE "TONETYPE" USING tone::"TONETYPE",
            ALTER COLUMN tone SET DEFAULT 'NORMAL'
        """)
    except Exception:
        # If conversion fails, set to default and then convert
        op.execute("UPDATE drafts SET tone = 'NORMAL' WHERE tone IS NULL OR tone NOT IN ('BRIEF', 'NORMAL', 'FORMAL')")
        op.execute("""
            ALTER TABLE drafts 
            ALTER COLUMN tone TYPE "TONETYPE" USING tone::"TONETYPE",
            ALTER COLUMN tone SET DEFAULT 'NORMAL'
        """)


def downgrade() -> None:
    # We leave the enum in the DB to avoid breaking tables
    # Just convert the column back to VARCHAR if needed
    try:
        op.execute("""
            ALTER TABLE drafts 
            ALTER COLUMN tone TYPE VARCHAR USING tone::text
        """)
    except Exception:
        pass
