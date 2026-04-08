from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'g5b8c7d4e3f2'
down_revision = 'f4a7b6c3d2e1'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Explicitly create ENUM types
    sa.Enum('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED', name='TASKSTATUS').create(op.get_bind(), checkfirst=True)
    sa.Enum('REPLY', 'REVIEW', 'SCHEDULE', 'FOLLOWUP', name='TASKTYPE').create(op.get_bind(), checkfirst=True)
    sa.Enum('DO_NOW', 'DO_TODAY', 'CAN_WAIT', name='PRIORITYLEVEL').create(op.get_bind(), checkfirst=True)
    sa.Enum('QUICK', 'DEEP_WORK', name='EFFORTLEVEL').create(op.get_bind(), checkfirst=True)

def downgrade() -> None:
    # We leave the enums in the DB in downgrade to avoid breaking tables
    pass
