"""
Dashboard Contracts
-------------------
Data structures for the dashboard aggregation layer.
"""

from typing import List, Optional
from pydantic import BaseModel

class BriefingDTO(BaseModel):
    """AI-generated briefing summary for the dashboard."""
    summary: str
    suggested_actions: List[str] = []
    tone: Optional[str] = "professional"

class DashboardStats(BaseModel):
    """Key metrics for the dashboard."""
    unread: int
    unread_delta: str
    urgent: int
    tasks_due: int
    awaiting_reply: int

# We need to forward reference ThreadListItem and TaskDTOv1 or import them.
# To avoid circular imports in contracts, we might need to use generic List[dict] or ensure imports work.
# However, assuming they are available or we can duplicate/import.
# Let's import the necessary types if possible, or use 'Any' for now to be safe and avoid circular deps if they are in other contract files.
# Actually, TaskDTOv1 is in contracts.task (likely). ThreadListItem might be in contracts.thread or api.routes.threads.
# Let's assume they are imported. But wait, `ThreadListItem` was imported in `api/routes/dashboard.py` from `api.routes.threads`.
# This is bad practice to import distinct API schemas into a shared contract. 
# Best practice: Move ThreadListItem to `contracts/thread.py` or similar.

# For now, to fix the crash quickly:
class DashboardData(BaseModel):
    """Full dashboard response model."""
    stats: DashboardStats
    briefing: BriefingDTO
    recent_threads: List[dict] # Using dict to avoid circular imports for now, or we can try to import if standard.
    priority_tasks: List[dict] # same here
