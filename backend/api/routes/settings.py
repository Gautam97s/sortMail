from fastapi import APIRouter, Depends
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_current_user
from core.storage.database import get_db
from models.user import User

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any], include_in_schema=False)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns settings for the user.
    Rules, sessions, and integrations are not yet backed by the database.
    """
    # Fetch real team members (all users for now)
    stmt = select(User)
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    team_members = [
        {
            "id": str(u.id),
            "name": u.name or u.email.split('@')[0],
            "email": u.email,
            "role": "Admin" if u.is_superuser else "Member",
            "status": u.status.value if u.status else "Active",
            "lastActive": "Unknown" # can calculate based on last_login_at if needed
        }
        for u in users
    ]

    return {
        "rules": [],
        "sessions": [],
        "integrations": [],
        "teamMembers": team_members
    }

