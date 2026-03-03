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

@router.get("/by-email/{email}", response_model=ContactResponse)
async def get_contact_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single contact by email address."""
    stmt = select(Contact).where(Contact.email_address == email, Contact.user_id == current_user.id)
    contact = (await db.execute(stmt)).scalars().first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    return {
        "id": contact.id,
        "email_address": contact.email_address,
        "name": contact.name,
        "company": contact.company,
        "interaction_count": contact.interaction_count,
        "is_unsubscribed": contact.is_unsubscribed,
        "is_vip": contact.is_vip,
        "last_interaction_at": contact.last_interaction_at.isoformat() if contact.last_interaction_at else None
    }

from datetime import datetime
class ThreadListItemMeta(BaseModel):
    thread_id: str
    subject: str
    summary: str
    intent: str
    urgency_score: int
    last_updated: datetime
    has_attachments: bool

@router.get("/{contact_id}/threads", response_model=list[ThreadListItemMeta])
async def list_contact_threads(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List threads for a specific contact."""
    # First get the contact to get the email
    stmt = select(Contact).where(Contact.id == contact_id, Contact.user_id == current_user.id)
    contact = (await db.execute(stmt)).scalars().first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    from models.thread import Thread
    from models.email import Email
    
    # Refined query: Threads where the contact is the SENDER of at least one message
    stmt = (
        select(Thread)
        .join(Email, Email.thread_id == Thread.id)
        .where(
            Thread.user_id == current_user.id,
            Email.sender == contact.email_address
        )
        .distinct()
        .order_by(desc(Thread.last_email_at))
        .limit(50)
    )
    threads = (await db.execute(stmt)).scalars().all()
    
    return [
        ThreadListItemMeta(
            thread_id=t.id,
            subject=t.subject or "(No Subject)",
            summary=t.summary or "",
            intent=t.intent or "neutral",
            urgency_score=t.urgency_score or 0,
            last_updated=t.last_email_at or t.created_at,
            has_attachments=t.has_attachments or False
        )
        for t in threads
    ]

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
