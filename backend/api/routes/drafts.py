"""
API Routes - Drafts
-------------------
Draft generation endpoints.
"""

import re
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from core.auth.token_manager import get_valid_google_token
from core.ingestion.gmail_client import GmailClient
from core.storage.database import get_db
from models.draft import ToneType
from api.dependencies import get_current_user
from models.user import User
from models.draft import Draft, DraftStatus, DraftTone
from models.email import Email
from core.credits.credit_service import InsufficientCreditsError
from sqlalchemy import select, desc, and_, or_, func, exists
import logging
import uuid
from datetime import datetime, timezone
from core.intelligence.pipeline import _load_thread, _load_messages
from core.intelligence.llama_engine import _call_llama, _call_llama_with_usage
from api.routes.bin import create_bin_item
from app.config import settings
from core.intelligence.prompts import (
    DRAFT_REPLY_SYSTEM_PROMPT,
    DRAFT_REPLY_USER_PROMPT_TEMPLATE,
    FREEFORM_DRAFT_SYSTEM_PROMPT,
    FREEFORM_DRAFT_USER_PROMPT_TEMPLATE,
)

logger = logging.getLogger(__name__)

router = APIRouter()


class DraftRequest(BaseModel):
    """Request to generate a draft reply."""
    thread_id: str
    tone: ToneType = ToneType.NORMAL
    additional_context: Optional[str] = None


class DraftResponse(BaseModel):
    id: str
    thread_id: str
    external_id: str
    subject: str
    body: str
    tone: str
    status: str
    created_at: str
    metadata_json: Optional[dict] = None

    class Config:
        from_attributes = True

class ScheduleDraftRequest(BaseModel):
    scheduled_for_date: str # ISO format expected


class UpdateDraftRequest(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    tone: Optional[ToneType] = None
    to: Optional[List[str]] = None
    cc: Optional[List[str]] = None
    bcc: Optional[List[str]] = None
    attachments: Optional[List[dict]] = None


class FreeformDraftRequest(BaseModel):
    tone: ToneType = ToneType.NORMAL
    subject: Optional[str] = None
    instruction: Optional[str] = None
    to: Optional[List[str]] = None


class DirectComposeRequest(BaseModel):
    subject: str
    body: str
    to: List[str]
    cc: Optional[List[str]] = None
    bcc: Optional[List[str]] = None
    attachments: Optional[List[dict]] = None


def _extract_email(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    match = re.search(r'<([^>]+)>', value)
    if match:
        return match.group(1).strip().lower()
    if '@' in value:
        return value.strip().lower()
    return None


def _normalize_email_list(values: Optional[List[str]]) -> List[str]:
    if not values:
        return []
    seen = set()
    result: List[str] = []
    for raw in values:
        email = _extract_email(raw)
        if not email:
            continue
        if email in seen:
            continue
        seen.add(email)
        result.append(email)
    return result


def _validate_recipient_list(values: List[str]) -> List[str]:
    normalized = _normalize_email_list(values)
    if not normalized:
        raise HTTPException(status_code=400, detail="At least one valid recipient is required")
    return normalized


def _build_thread_context(messages: list[dict], max_messages: int = 3, max_chars: int = 450) -> str:
    selected = messages[-max_messages:]
    context_parts: list[str] = []
    for message in selected:
        sender = message.get("from", "Unknown")
        body = (message.get("body", "") or "")[:max_chars]
        context_parts.append(f"{sender}: {body}")
    return "\n\n".join(context_parts)


def _is_no_reply_needed(text: str) -> bool:
    return (text or "").strip().upper() == "NO_REPLY_NEEDED"


async def _resolve_reply_target(db: AsyncSession, draft: Draft, current_user: User) -> str:
    """Find a recipient email for the draft send action."""
    latest_stmt = (
        select(Email)
        .where(
            Email.thread_id == draft.thread_id,
            Email.user_id == current_user.id,
        )
        .order_by(desc(Email.received_at))
        .limit(1)
    )
    latest_email = (await db.execute(latest_stmt)).scalars().first()

    # Prefer replying to the latest sender when it is not the current user.
    if latest_email:
        sender_email = _extract_email(latest_email.sender)
        if sender_email and sender_email != current_user.email.lower():
            return sender_email

        recipients = latest_email.recipients or []
        for recipient in recipients:
            candidate = (recipient or {}).get("email")
            if candidate and candidate.lower() != current_user.email.lower():
                return candidate.lower()

    # Fallback: scan thread participants.
    thread = await _load_thread(draft.thread_id, current_user.id, db)
    if thread and thread.participants:
        for participant in thread.participants:
            participant_email = _extract_email(participant)
            if participant_email and participant_email != current_user.email.lower():
                return participant_email

    raise HTTPException(status_code=400, detail="Unable to resolve recipient for this draft")


@router.post("/generate-freeform")
async def generate_freeform_draft(
    payload: FreeformDraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate draft body for a new email without requiring an existing thread."""
    tone_val = payload.tone.value if hasattr(payload.tone, 'value') else payload.tone
    target = ", ".join(_normalize_email_list(payload.to)) if payload.to else "a recipient"
    try:
        prompt = FREEFORM_DRAFT_USER_PROMPT_TEMPLATE.format(
            recipient_context=target,
            subject=payload.subject or "General outreach",
            tone=tone_val,
            instruction=payload.instruction or "No additional instruction",
        )

        chat_messages = [{"role": "system", "content": FREEFORM_DRAFT_SYSTEM_PROMPT}, {"role": "user", "content": prompt}]
        generated_text = (
            await _call_llama(
                chat_messages,
                max_tokens=900,
                operation="draft_freeform",
                metadata={
                    "user_id": current_user.id,
                    "related_entity_type": "draft",
                    "related_entity_id": "freeform",
                },
                allow_auth_fallback=False,
            )
        ).strip()
        return {
            "subject": payload.subject or "",
            "body": generated_text,
            "tone": tone_val,
            "generated_for": current_user.id,
        }
    except InsufficientCreditsError:
        await db.rollback()
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Freeform draft generation failed: {exc}")


@router.post("/send-direct")
async def send_direct_email(
    payload: DirectComposeRequest,
    current_user: User = Depends(get_current_user),
):
    """Send an email directly from compose UI without an existing thread draft record."""
    to_list = _validate_recipient_list(payload.to)
    cc_list = _normalize_email_list(payload.cc)
    bcc_list = _normalize_email_list(payload.bcc)

    access_token = await get_valid_google_token(current_user.id)
    gmail = GmailClient(access_token, current_user.id)
    provider_message_id = await gmail.send_message(
        to=",".join(to_list),
        subject=payload.subject,
        body=payload.body,
        cc=",".join(cc_list) if cc_list else None,
        bcc=",".join(bcc_list) if bcc_list else None,
        attachments=payload.attachments or [],
    )
    return {"status": "success", "message": "Email sent", "provider_message_id": provider_message_id}


@router.post("/save-direct")
async def save_direct_email_draft(
    payload: DirectComposeRequest,
    current_user: User = Depends(get_current_user),
):
    """Save an email directly to Gmail drafts without creating a thread-bound draft record."""
    to_list = _validate_recipient_list(payload.to)
    cc_list = _normalize_email_list(payload.cc)
    bcc_list = _normalize_email_list(payload.bcc)

    access_token = await get_valid_google_token(current_user.id)
    gmail = GmailClient(access_token, current_user.id)
    provider_draft_id = await gmail.create_draft(
        to=",".join(to_list),
        subject=payload.subject,
        body=payload.body,
        cc=",".join(cc_list) if cc_list else None,
        bcc=",".join(bcc_list) if bcc_list else None,
        attachments=payload.attachments or [],
    )
    return {"status": "success", "message": "Saved to Gmail drafts", "provider_draft_id": provider_draft_id}


@router.post("/", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a draft reply for a thread. (Cost: 3 credits)
    """
    try:
        # Load real thread and context
        thread = await _load_thread(request.thread_id, current_user.id, db)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
            
        messages = await _load_messages(request.thread_id, db)
            
        tone_val = request.tone.value if hasattr(request.tone, 'value') else request.tone
        draft_id = str(uuid.uuid4())
        prompt = DRAFT_REPLY_USER_PROMPT_TEMPLATE.format(
            tone=tone_val,
            instruction=request.additional_context or "No additional instruction",
            thread_context=_build_thread_context(messages, max_messages=3, max_chars=450),
        )

        chat_messages = [{"role": "system", "content": DRAFT_REPLY_SYSTEM_PROMPT}, {"role": "user", "content": prompt}]
        llm_result = await _call_llama_with_usage(
            chat_messages,
            max_tokens=900,
            operation="draft_reply",
            metadata={
                "user_id": current_user.id,
                "related_entity_type": "thread",
                "related_entity_id": request.thread_id,
            },
            allow_auth_fallback=False,
        )
        generated_text = (llm_result.get("text") or "").strip()

        if _is_no_reply_needed(generated_text):
            await db.rollback()
            raise HTTPException(status_code=409, detail="NO_REPLY_NEEDED")
        
        draft = Draft(
            id=draft_id,
            user_id=current_user.id,
            thread_id=request.thread_id,
            subject=f"Re: {thread.subject}",
            content=generated_text,
            body=generated_text,
            tone=request.tone,
            generation_model=llm_result.get("model_id") or settings.BEDROCK_MODEL_ID,
            tokens_used=int(llm_result.get("input_tokens", 0)) + int(llm_result.get("output_tokens", 0)),
            cost_cents=0,
            status=DraftStatus.GENERATED.value
        )
        db.add(draft)
        
        await db.commit()
        
        return {
            "id": draft.id,
            "thread_id": draft.thread_id,
            "external_id": thread.external_id,
            "subject": draft.subject,
            "body": draft.body,
            "tone": draft.tone,
            "status": draft.status,
            "created_at": draft.created_at.isoformat() if draft.created_at else "",
            "metadata_json": draft.metadata_json,
        }
    except InsufficientCreditsError:
        await db.rollback()
        raise HTTPException(status_code=402, detail="Insufficient credits.")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {str(e)}")


@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an existing draft."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    thread = await _load_thread(draft.thread_id, current_user.id, db)
    return {
        "id": draft.id,
        "thread_id": draft.thread_id,
        "external_id": thread.external_id if thread else "",
        "subject": draft.subject,
        "body": draft.body,
        "tone": draft.tone,
        "status": draft.status,
        "created_at": draft.created_at.isoformat() if draft.created_at else "",
        "metadata_json": draft.metadata_json,
    }


@router.post("/{draft_id}/regenerate", response_model=DraftResponse)
async def regenerate_draft(
    draft_id: str,
    tone: Optional[ToneType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate a draft. (Cost: 3 credits)"""
    try:
        # 1. Fetch existing draft to get thread_id reference
        stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
        draft = (await db.execute(stmt)).scalars().first()
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")

        # 2. Load context
        thread = await _load_thread(draft.thread_id, current_user.id, db)
        if not thread:
            raise HTTPException(status_code=404, detail="Source thread not found")
        messages = await _load_messages(draft.thread_id, db)

        # 3. Formulate Prompt
        messages_text = _build_thread_context(messages)

        target_tone = tone or draft.tone
        tone_val = target_tone.value if hasattr(target_tone, 'value') else target_tone
        prompt = DRAFT_REPLY_USER_PROMPT_TEMPLATE.format(
            tone=tone_val,
            instruction="Rewrite the existing draft with the same intent and clearer wording.",
            thread_context=messages_text,
        )

        # 4. Generate
        chat_messages = [{"role": "system", "content": DRAFT_REPLY_SYSTEM_PROMPT}, {"role": "user", "content": prompt}]
        llm_result = await _call_llama_with_usage(
            chat_messages,
            max_tokens=900,
            operation="draft_regenerate",
            metadata={
                "user_id": current_user.id,
                "related_entity_type": "draft",
                "related_entity_id": draft_id,
            },
            allow_auth_fallback=False,
        )
        generated_text = (llm_result.get("text") or "").strip()

        if _is_no_reply_needed(generated_text):
            await db.rollback()
            raise HTTPException(status_code=409, detail="NO_REPLY_NEEDED")
        
        # 5. Update draft
        draft.content = generated_text
        draft.body = generated_text
        if tone:
            draft.tone = tone
        draft.generation_model = llm_result.get("model_id") or settings.BEDROCK_MODEL_ID
        draft.tokens_used = int(llm_result.get("input_tokens", 0)) + int(llm_result.get("output_tokens", 0))
        draft.cost_cents = 0

        await db.commit()
        
        return {
            "id": draft.id,
            "thread_id": draft.thread_id,
            "external_id": thread.external_id,
            "subject": draft.subject,
            "body": draft.body,
            "tone": draft.tone,
            "status": draft.status,
            "created_at": draft.created_at.isoformat() if draft.created_at else "",
            "metadata_json": draft.metadata_json,
        }
    except InsufficientCreditsError as e:
        await db.rollback()
        raise HTTPException(status_code=402, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise e


@router.delete("/{draft_id}")
async def delete_draft(
    draft_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a draft."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    db.add(
        create_bin_item(
            user_id=current_user.id,
            entity_type="draft",
            entity_id=draft.id,
            entity_label=draft.subject,
            payload_json={
                "status": draft.status,
                "thread_id": draft.thread_id,
            },
        )
    )
    draft.deleted_at = datetime.now(timezone.utc)
    draft.status = DraftStatus.DISCARDED.value
    await db.commit()
    return {"draft_id": draft_id, "deleted": True, "restore_window_days": 30}


@router.patch("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: str,
    payload: UpdateDraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Persist user edits to an existing draft."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    if payload.subject is not None:
        draft.subject = payload.subject
    if payload.body is not None:
        draft.body = payload.body
        draft.content = payload.body
        draft.user_edited = True
    if payload.tone is not None:
        draft.tone = payload.tone

    metadata = draft.metadata_json or {}
    if payload.to is not None:
        metadata["to"] = _normalize_email_list(payload.to)
    if payload.cc is not None:
        metadata["cc"] = _normalize_email_list(payload.cc)
    if payload.bcc is not None:
        metadata["bcc"] = _normalize_email_list(payload.bcc)
    if payload.attachments is not None:
        metadata["attachments"] = payload.attachments
    draft.metadata_json = metadata

    if draft.status != DraftStatus.SENT.value:
        draft.status = DraftStatus.EDITED.value

    await db.commit()

    thread = await _load_thread(draft.thread_id, current_user.id, db)
    return {
        "id": draft.id,
        "thread_id": draft.thread_id,
        "external_id": thread.external_id if thread else "",
        "subject": draft.subject,
        "body": draft.body,
        "tone": draft.tone,
        "status": draft.status,
        "created_at": draft.created_at.isoformat() if draft.created_at else "",
        "metadata_json": draft.metadata_json,
    }


@router.get("", response_model=list[DraftResponse])
async def list_drafts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all pending AI drafts for the current user.

    Excludes drafts for threads whose latest sender is an unsubscribed contact.
    """
    from models.thread import Thread
    from models.email import Email
    from models.contact import Contact

    # Correlated NOT EXISTS: same pattern as /api/threads
    sender_is_unsubscribed = exists(
        select(Contact.id).where(
            Contact.user_id == current_user.id,
            Contact.is_unsubscribed == True,
            Email.sender.ilike(func.concat('%', Contact.email_address, '%'))
        ).correlate(Email)
    )

    unsub_thread_ids = (
        select(Thread.id)
        .join(Email, and_(Email.thread_id == Thread.id, Email.received_at == Thread.last_email_at))
        .where(
            Thread.user_id == current_user.id,
            sender_is_unsubscribed
        )
        .scalar_subquery()
    )

    stmt = (
        select(Draft, Thread.external_id)
        .join(Thread, Thread.id == Draft.thread_id)
        .where(
            Draft.user_id == current_user.id,
            Draft.deleted_at.is_(None),
            Draft.status.in_([
                DraftStatus.GENERATED.value,
                DraftStatus.EDITED.value,
                DraftStatus.SENT.value,
            ]),
            Draft.thread_id.not_in(unsub_thread_ids)
        )
        .order_by(desc(Draft.created_at))
    )
    results = (await db.execute(stmt)).all()

    final_result = []
    for d, ext_id in results:
        final_result.append({
            "id": d.id,
            "thread_id": d.thread_id,
            "external_id": ext_id or "",
            "subject": d.subject,
            "body": d.body or d.content,
            "tone": d.tone.value if hasattr(d.tone, "value") else str(d.tone),
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else "",
            "metadata_json": d.metadata_json,
        })
    return final_result

@router.post("/{draft_id}/approve")
async def approve_draft_for_send(
    draft_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a draft to be sent immediately."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    thread = await _load_thread(draft.thread_id, current_user.id, db)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    try:
        metadata = draft.metadata_json or {}
        to_list = _normalize_email_list(metadata.get("to"))
        cc_list = _normalize_email_list(metadata.get("cc"))
        bcc_list = _normalize_email_list(metadata.get("bcc"))
        attachments = metadata.get("attachments") or []

        if not to_list:
            to_list = [await _resolve_reply_target(db, draft, current_user)]
        recipient = ",".join(to_list)

        if thread.provider == "GMAIL":
            access_token = await get_valid_google_token(current_user.id)
            gmail = GmailClient(access_token, current_user.id)
            provider_message_id = await gmail.send_message(
                to=recipient,
                subject=draft.subject,
                body=draft.body or draft.content or "",
                thread_id=thread.external_id,
                cc=",".join(cc_list) if cc_list else None,
                bcc=",".join(bcc_list) if bcc_list else None,
                attachments=attachments,
            )

            metadata["provider_message_id"] = provider_message_id
            metadata["provider_action"] = "sent"
            metadata["recipient"] = recipient
            draft.metadata_json = metadata
        else:
            # Outlook live-send integration not implemented yet.
            raise HTTPException(status_code=501, detail="Outlook send is not implemented yet")

        draft.status = DraftStatus.SENT.value
        draft.sent_at = datetime.now(timezone.utc)
        await db.commit()
        return {"status": "success", "message": "Draft sent", "draft_id": draft_id}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception("Failed to send draft %s", draft_id)
        raise HTTPException(status_code=500, detail=f"Failed to send draft: {exc}")

@router.post("/{draft_id}/schedule")
async def schedule_draft(
    draft_id: str,
    payload: ScheduleDraftRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a draft for send-later and create provider-side draft when possible."""
    stmt = select(Draft).where(Draft.id == draft_id, Draft.user_id == current_user.id)
    draft = (await db.execute(stmt)).scalars().first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    thread = await _load_thread(draft.thread_id, current_user.id, db)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    try:
        scheduled_time = datetime.fromisoformat(payload.scheduled_for_date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ISO date format.")
        
    try:
        metadata = draft.metadata_json or {}
        to_list = _normalize_email_list(metadata.get("to"))
        cc_list = _normalize_email_list(metadata.get("cc"))
        bcc_list = _normalize_email_list(metadata.get("bcc"))
        attachments = metadata.get("attachments") or []
        if not to_list:
            to_list = [await _resolve_reply_target(db, draft, current_user)]
        recipient = ",".join(to_list)
        metadata["scheduled_for"] = scheduled_time.isoformat()

        if thread.provider == "GMAIL":
            access_token = await get_valid_google_token(current_user.id)
            gmail = GmailClient(access_token, current_user.id)
            provider_draft_id = await gmail.create_draft(
                to=recipient,
                subject=draft.subject,
                body=draft.body or draft.content or "",
                thread_id=thread.external_id,
                cc=",".join(cc_list) if cc_list else None,
                bcc=",".join(bcc_list) if bcc_list else None,
                attachments=attachments,
            )
            metadata["provider_draft_id"] = provider_draft_id
            metadata["provider_action"] = "draft_saved"
            metadata["recipient"] = recipient
        else:
            metadata["provider_action"] = "scheduled_backend_only"

        # Keep as EDITED (reviewed + queued for send-later)
        draft.status = DraftStatus.EDITED.value
        draft.metadata_json = metadata

        logger.info("Draft %s scheduled for %s", draft_id, scheduled_time.isoformat())
        await db.commit()
        return {
            "status": "success",
            "message": f"Draft scheduled for {scheduled_time.isoformat()}",
            "draft_id": draft_id,
        }
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.exception("Failed to schedule draft %s", draft_id)
        raise HTTPException(status_code=500, detail=f"Failed to schedule draft: {exc}")

