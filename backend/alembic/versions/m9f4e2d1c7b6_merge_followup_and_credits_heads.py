"""Merge followup and credits migration heads

Revision ID: m9f4e2d1c7b6
Revises: followup_001, k8e2f3a4b5c6
Create Date: 2026-04-12 02:45:00.000000
"""

from typing import Sequence, Union

revision: str = "m9f4e2d1c7b6"
down_revision: Union[str, Sequence[str], None] = ("followup_001", "k8e2f3a4b5c6")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
