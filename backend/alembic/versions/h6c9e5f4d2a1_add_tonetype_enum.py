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

revision: str = 'h6c9e5f4d2a1'
down_revision: Union[str, None] = 'g5b8c7d4e3f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create quoted TONETYPE enum with valid values (matches app SQL casts to "TONETYPE").
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TONETYPE') THEN
                CREATE TYPE "TONETYPE" AS ENUM ('BRIEF', 'NORMAL', 'FORMAL');
            END IF;
        END$$;
    """)
    
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
    
    # Convert through TEXT to avoid enum-to-enum assignment/cast incompatibilities,
    # then cast to the quoted "TONETYPE" used by application queries.
    op.execute("""
        DO $$
        BEGIN
            -- Step 1: Force to TEXT regardless of current type.
            ALTER TABLE drafts
            ALTER COLUMN tone TYPE TEXT USING tone::text;

            -- Step 2: Normalize/correct values in TEXT form.
            UPDATE drafts
            SET tone = CASE
                WHEN tone IS NULL THEN 'NORMAL'
                WHEN UPPER(tone) IN ('BRIEF', 'NORMAL', 'FORMAL') THEN UPPER(tone)
                ELSE 'NORMAL'
            END;

            -- Step 3: Cast to quoted enum used by runtime SQL.
            ALTER TABLE drafts
            ALTER COLUMN tone TYPE "TONETYPE" USING tone::"TONETYPE";

            ALTER TABLE drafts
            ALTER COLUMN tone SET DEFAULT 'NORMAL';
        END$$;
    """)


def downgrade() -> None:
    # We leave the enum in the DB to avoid breaking tables
    # Just convert the column back to VARCHAR if needed
    op.execute("""
        ALTER TABLE drafts
        ALTER COLUMN tone TYPE VARCHAR USING tone::text
    """)
