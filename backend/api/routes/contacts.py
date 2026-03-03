import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from core.storage.database import get_db
from models.user import User
from models.contact import Contact
from api.dependencies import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

class ContactResponse(BaseModel):
    id: str
    email_address: str
    name: str | None
    company: str | None
    interaction_count: int
    is_unsubscribed: bool
    is_vip: bool
    last_interaction_at: str | None

    class Config:
        from_attributes = True

@router.get("", response_model=list[ContactResponse])
async def list_contacts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contacts for the current user, sorted by interaction count."""
    stmt = (
        select(Contact)
        .where(Contact.user_id == current_user.id)
        .order_by(desc(Contact.interaction_count))
    )
    contacts = (await db.execute(stmt)).scalars().all()
    
    result = []
    for c in contacts:
        result.append({
            "id": c.id,
            "email_address": c.email_address,
            "name": c.name,
            "company": c.company,
            "interaction_count": c.interaction_count,
            "is_unsubscribed": c.is_unsubscribed,
            "is_vip": c.is_vip,
            "last_interaction_at": c.last_interaction_at.isoformat() if c.last_interaction_at else None
        })
    return result

@router.post("/{contact_id}/unsubscribe")
async def toggle_unsubscribe(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle the unsubscribe flag for a specific contact."""
    stmt = select(Contact).where(Contact.id == contact_id, Contact.user_id == current_user.id)
    contact = (await db.execute(stmt)).scalars().first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    contact.is_unsubscribed = not contact.is_unsubscribed
    await db.commit()
    
    return {"status": "success", "is_unsubscribed": contact.is_unsubscribed}
