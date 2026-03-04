import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, func, any_, cast, String
from sqlalchemy.dialects.postgresql import ARRAY

from core.storage.database import get_db
from models.user import User
from models.contact import Contact
from models.tag import Tag
from api.dependencies import get_current_user
from pydantic import BaseModel
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

router = APIRouter()

class TagResponse(BaseModel):
    id: str
    name: str
    color_hex: str

    class Config:
        from_attributes = True

class ContactResponse(BaseModel):
    id: str
    email_address: str
    name: str | None
    company: str | None
    interaction_count: int
    is_unsubscribed: bool
    is_vip: bool
    last_interaction_at: str | None
    tags: list[TagResponse] = []

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
        .options(selectinload(Contact.tags))
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
            "last_interaction_at": c.last_interaction_at.isoformat() if c.last_interaction_at else None,
            "tags": [{"id": t.id, "name": t.name, "color_hex": t.color_hex} for t in (c.tags or [])]
        })
    return result

@router.get("/by-email/{email}", response_model=ContactResponse)
async def get_contact_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single contact by email address."""
    stmt = (
        select(Contact)
        .where(Contact.email_address == email, Contact.user_id == current_user.id)
        .options(selectinload(Contact.tags))
    )
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
        "last_interaction_at": contact.last_interaction_at.isoformat() if contact.last_interaction_at else None,
        "tags": [{"id": t.id, "name": t.name, "color_hex": t.color_hex} for t in (contact.tags or [])]
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

    email_addr = contact.email_address.lower()

    # Fast query using array membership and indexed sender comparison.
    # ANY(recipients) is index-friendly; avoids CAST(array AS VARCHAR) ILIKE
    # which cannot use any index and does a full table scan.
    # We find thread_ids from emails first, then fetch threads by PK.
    email_ids_stmt = (
        select(Email.thread_id)
        .where(
            Email.user_id == current_user.id,
            or_(
                # Sender: use = for exact match or ILIKE for name <email> format
                Email.sender.ilike(f"%{email_addr}%"),
                # Recipients: exact array membership — fast, uses GIN index if present
                func.lower(email_addr) == any_(cast(Email.recipients, ARRAY(String))),
            )
        )
        .distinct()
        .subquery()
    )

    stmt = (
        select(Thread)
        .where(
            Thread.user_id == current_user.id,
            Thread.id.in_(select(email_ids_stmt))
        )
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

class TagCreate(BaseModel):
    name: str
    color_hex: str | None = None

@router.post("/{contact_id}/tags", response_model=TagResponse)
async def add_contact_tag(
    contact_id: str,
    tag_data: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign a tag to a contact. Creates the tag if it doesn't exist."""
    # 1. Get contact
    stmt = select(Contact).where(Contact.id == contact_id, Contact.user_id == current_user.id).options(selectinload(Contact.tags))
    contact = (await db.execute(stmt)).scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    # 2. Get or create tag
    tag_stmt = select(Tag).where(Tag.user_id == current_user.id, Tag.name.ilike(tag_data.name))
    tag = (await db.execute(tag_stmt)).scalars().first()
    
    if not tag:
        tag = Tag(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name=tag_data.name,
            color_hex=tag_data.color_hex or "#E2E8F0"
        )
        db.add(tag)
        
    # 3. Associate
    if tag not in contact.tags:
        contact.tags.append(tag)
        await db.commit()
        
    return tag

@router.delete("/{contact_id}/tags/{tag_id}")
async def remove_contact_tag(
    contact_id: str,
    tag_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a tag association from a contact."""
    stmt = select(Contact).where(Contact.id == contact_id, Contact.user_id == current_user.id).options(selectinload(Contact.tags))
    contact = (await db.execute(stmt)).scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    tag = next((t for t in contact.tags if t.id == tag_id), None)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found on this contact")
        
    contact.tags.remove(tag)
    await db.commit()
    
    return {"status": "success"}

@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single contact by ID."""
    stmt = select(Contact).where(Contact.id == contact_id, Contact.user_id == current_user.id).options(selectinload(Contact.tags))
    contact = (await db.execute(stmt)).scalars().first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    return contact
