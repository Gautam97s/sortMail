from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from api.dependencies import get_current_user
from core.storage.database import get_db
from models.user import User
from models.user_settings import UserSettings
import uuid as _uuid

router = APIRouter()


class AIPreferencesOut(BaseModel):
    model: str
    tone: str
    auto_draft: bool
    summary_length: int


class AIPreferencesUpdateRequest(BaseModel):
    model: str | None = None
    tone: str | None = None
    auto_draft: bool | None = None
    summary_length: int | None = Field(default=None, ge=20, le=100)


class PrivacyPreferencesOut(BaseModel):
    data_retention: str
    email_tracking: bool
    read_receipts: bool


class PrivacyPreferencesUpdateRequest(BaseModel):
    data_retention: str | None = None
    email_tracking: bool | None = None
    read_receipts: bool | None = None


async def _get_or_create_user_settings(db: AsyncSession, user_id: str) -> UserSettings:
    stmt = select(UserSettings).where(UserSettings.user_id == user_id)
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if row:
        return row

    row = UserSettings(
        id=str(_uuid.uuid4()),
        user_id=user_id,
        ai_model="bedrock-nova",
        ai_tone="NORMAL",
        ai_auto_draft=False,
        ai_summary_length=50,
        privacy_data_retention="1year",
        privacy_email_tracking=False,
        privacy_read_receipts=True,
    )
    db.add(row)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        result = await db.execute(stmt)
        row = result.scalar_one_or_none()
        if row:
            return row
        raise HTTPException(status_code=500, detail="Failed to initialize user settings")

    return row

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
    # Scope team members to the current user's workspace.
    # If user is not assigned to a workspace yet, only return self.
    if current_user.workspace_id:
        stmt = select(User).where(User.workspace_id == current_user.workspace_id)
    else:
        stmt = select(User).where(User.id == current_user.id)
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

    user_settings = await _get_or_create_user_settings(db, str(current_user.id))

    return {
        "rules": [],
        "sessions": [],
        "integrations": [],
        "teamMembers": team_members,
        "aiPreferences": {
            "model": user_settings.ai_model,
            "tone": user_settings.ai_tone,
            "auto_draft": user_settings.ai_auto_draft,
            "summary_length": user_settings.ai_summary_length,
        },
        "privacyPreferences": {
            "data_retention": user_settings.privacy_data_retention,
            "email_tracking": user_settings.privacy_email_tracking,
            "read_receipts": user_settings.privacy_read_receipts,
        },
    }


@router.get("/preferences/ai", response_model=AIPreferencesOut)
async def get_ai_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = await _get_or_create_user_settings(db, str(current_user.id))
    return AIPreferencesOut(
        model=settings.ai_model,
        tone=settings.ai_tone,
        auto_draft=settings.ai_auto_draft,
        summary_length=settings.ai_summary_length,
    )


@router.patch("/preferences/ai", response_model=AIPreferencesOut)
async def update_ai_preferences(
    body: AIPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = await _get_or_create_user_settings(db, str(current_user.id))

    if body.model is not None:
        settings.ai_model = body.model
    if body.tone is not None:
        settings.ai_tone = body.tone
    if body.auto_draft is not None:
        settings.ai_auto_draft = body.auto_draft
    if body.summary_length is not None:
        settings.ai_summary_length = body.summary_length

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update AI preferences")

    return AIPreferencesOut(
        model=settings.ai_model,
        tone=settings.ai_tone,
        auto_draft=settings.ai_auto_draft,
        summary_length=settings.ai_summary_length,
    )


@router.get("/preferences/privacy", response_model=PrivacyPreferencesOut)
async def get_privacy_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = await _get_or_create_user_settings(db, str(current_user.id))
    return PrivacyPreferencesOut(
        data_retention=settings.privacy_data_retention,
        email_tracking=settings.privacy_email_tracking,
        read_receipts=settings.privacy_read_receipts,
    )


@router.patch("/preferences/privacy", response_model=PrivacyPreferencesOut)
async def update_privacy_preferences(
    body: PrivacyPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = await _get_or_create_user_settings(db, str(current_user.id))

    if body.data_retention is not None:
        settings.privacy_data_retention = body.data_retention
    if body.email_tracking is not None:
        settings.privacy_email_tracking = body.email_tracking
    if body.read_receipts is not None:
        settings.privacy_read_receipts = body.read_receipts

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update privacy preferences")

    return PrivacyPreferencesOut(
        data_retention=settings.privacy_data_retention,
        email_tracking=settings.privacy_email_tracking,
        read_receipts=settings.privacy_read_receipts,
    )

