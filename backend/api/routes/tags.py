import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.storage.database import get_db
from models.user import User
from models.tag import Tag
from api.dependencies import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

class TagResponse(BaseModel):
    id: str
    name: str
    color_hex: str | None
    is_auto_applied: bool

    class Config:
        from_attributes = True

class UpdateTagRequest(BaseModel):
    color_hex: str

@router.get("", response_model=list[TagResponse])
async def list_tags(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tags for the current user."""
    stmt = select(Tag).where(Tag.user_id == current_user.id).order_by(Tag.name)
    tags = (await db.execute(stmt)).scalars().all()
    
    result = []
    for t in tags:
        result.append({
            "id": t.id,
            "name": t.name,
            "color_hex": t.color_hex,
            "is_auto_applied": t.is_auto_applied
        })
    return result

@router.patch("/{tag_id}")
async def update_tag(
    tag_id: str,
    payload: UpdateTagRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a tag's color."""
    stmt = select(Tag).where(Tag.id == tag_id, Tag.user_id == current_user.id)
    tag = (await db.execute(stmt)).scalars().first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
        
    tag.color_hex = payload.color_hex
    await db.commit()
    
    return {"status": "success", "color_hex": tag.color_hex}
