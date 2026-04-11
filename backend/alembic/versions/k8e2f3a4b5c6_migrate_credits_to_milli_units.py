"""Migrate credit ledger storage to milli-credit units

Revision ID: k8e2f3a4b5c6
Revises: j7d1a2b3c4d5
Create Date: 2026-04-11 15:20:00.000000
"""

from typing import Sequence, Union
from alembic import op

revision: str = "k8e2f3a4b5c6"
down_revision: Union[str, None] = "j7d1a2b3c4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # user_credits
    op.execute(
        """
        ALTER TABLE user_credits
        ALTER COLUMN credits_balance TYPE BIGINT USING (credits_balance::bigint * 1000),
        ALTER COLUMN credits_total_earned TYPE BIGINT USING (credits_total_earned::bigint * 1000),
        ALTER COLUMN credits_total_spent TYPE BIGINT USING (credits_total_spent::bigint * 1000),
        ALTER COLUMN monthly_credits_allowance TYPE BIGINT USING (monthly_credits_allowance::bigint * 1000),
        ALTER COLUMN credits_used_this_month TYPE BIGINT USING (credits_used_this_month::bigint * 1000)
        """
    )

    # credit_transactions
    op.execute(
        """
        ALTER TABLE credit_transactions
        ALTER COLUMN amount TYPE BIGINT USING (amount::bigint * 1000),
        ALTER COLUMN balance_after TYPE BIGINT USING (balance_after::bigint * 1000)
        """
    )

    # credit_pricing
    op.execute(
        """
        ALTER TABLE credit_pricing
        ALTER COLUMN credits_cost TYPE BIGINT USING (credits_cost::bigint * 1000)
        """
    )

    # user_credit_limits
    op.execute(
        """
        ALTER TABLE user_credit_limits
        ALTER COLUMN max_credits_per_day TYPE BIGINT USING (
            CASE WHEN max_credits_per_day IS NULL THEN NULL ELSE max_credits_per_day::bigint * 1000 END
        ),
        ALTER COLUMN max_credits_per_operation TYPE BIGINT USING (
            CASE WHEN max_credits_per_operation IS NULL THEN NULL ELSE max_credits_per_operation::bigint * 1000 END
        )
        """
    )

    # credit_usage_daily
    op.execute(
        """
        ALTER TABLE credit_usage_daily
        ALTER COLUMN credits_used TYPE BIGINT USING (credits_used::bigint * 1000)
        """
    )

    # ai_usage_logs
    op.execute(
        """
        ALTER TABLE ai_usage_logs
        ALTER COLUMN credits_charged TYPE BIGINT USING (
            CASE WHEN credits_charged IS NULL THEN NULL ELSE credits_charged::bigint * 1000 END
        )
        """
    )

    # ai_usage_daily_summary
    op.execute(
        """
        ALTER TABLE ai_usage_daily_summary
        ALTER COLUMN total_credits_charged TYPE BIGINT USING (
            CASE WHEN total_credits_charged IS NULL THEN NULL ELSE total_credits_charged::bigint * 1000 END
        )
        """
    )


def downgrade() -> None:
    # Convert milli-credits back to whole-credit integer storage (truncates sub-credit precision).
    op.execute(
        """
        ALTER TABLE ai_usage_daily_summary
        ALTER COLUMN total_credits_charged TYPE INTEGER USING (
            CASE WHEN total_credits_charged IS NULL THEN NULL ELSE (total_credits_charged / 1000)::integer END
        )
        """
    )

    op.execute(
        """
        ALTER TABLE ai_usage_logs
        ALTER COLUMN credits_charged TYPE INTEGER USING (
            CASE WHEN credits_charged IS NULL THEN NULL ELSE (credits_charged / 1000)::integer END
        )
        """
    )

    op.execute(
        """
        ALTER TABLE credit_usage_daily
        ALTER COLUMN credits_used TYPE INTEGER USING ((credits_used / 1000)::integer)
        """
    )

    op.execute(
        """
        ALTER TABLE user_credit_limits
        ALTER COLUMN max_credits_per_day TYPE INTEGER USING (
            CASE WHEN max_credits_per_day IS NULL THEN NULL ELSE (max_credits_per_day / 1000)::integer END
        ),
        ALTER COLUMN max_credits_per_operation TYPE INTEGER USING (
            CASE WHEN max_credits_per_operation IS NULL THEN NULL ELSE (max_credits_per_operation / 1000)::integer END
        )
        """
    )

    op.execute(
        """
        ALTER TABLE credit_pricing
        ALTER COLUMN credits_cost TYPE INTEGER USING ((credits_cost / 1000)::integer)
        """
    )

    op.execute(
        """
        ALTER TABLE credit_transactions
        ALTER COLUMN amount TYPE INTEGER USING ((amount / 1000)::integer),
        ALTER COLUMN balance_after TYPE INTEGER USING ((balance_after / 1000)::integer)
        """
    )

    op.execute(
        """
        ALTER TABLE user_credits
        ALTER COLUMN credits_balance TYPE INTEGER USING ((credits_balance / 1000)::integer),
        ALTER COLUMN credits_total_earned TYPE INTEGER USING ((credits_total_earned / 1000)::integer),
        ALTER COLUMN credits_total_spent TYPE INTEGER USING ((credits_total_spent / 1000)::integer),
        ALTER COLUMN monthly_credits_allowance TYPE INTEGER USING ((monthly_credits_allowance / 1000)::integer),
        ALTER COLUMN credits_used_this_month TYPE INTEGER USING ((credits_used_this_month / 1000)::integer)
        """
    )
