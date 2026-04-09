"""
Intelligence Pipeline
----------------------
Orchestrates the full AI analysis of a saved thread.

Flow:
  1. Load thread + messages from DB
   2. Run llama_engine.run_intelligence() â€” single Llama 3.3 70B call via HF API
  3. Each module extracts its slice from the Gemini JSON:
       - summarizer        â†’ summary, key_points, suggested_action
       - intent_classifier â†’ intent, urgency_score, follow_up
       - deadline_extractorâ†’ calendar events / deadlines
       - entity_extractor  â†’ people, companies, action_items
  4. Save enriched intel back to Thread model (intel_json, summary, intent, urgency_score)
  5. Auto-create Tasks from action_items (no duplicates)
  6. Publish SSE event so frontend refreshes instantly
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.thread import Thread
from models.task import Task, TaskStatus, TaskType, PriorityLevel

# Intelligence engine â€” Llama 3.3 70B via HF Inference API
from .llama_engine import run_intelligence
from .summarizer import extract_summary, extract_key_points, extract_suggested_action, extract_suggested_draft
from .intent_classifier import extract_intent, extract_priority_level, should_follow_up
from .deadline_extractor import extract_deadlines, extract_expected_reply_by
from .entity_extractor import extract_entities, extract_action_items, extract_tags
from models.contact import Contact
from models.tag import Tag
from models.draft import Draft, DraftStatus, DraftTone
from core.app_metrics import record_metric

logger = logging.getLogger(__name__)

REPLY_INTENTS = {"ACTION_REQUIRED", "URGENT", "QUESTION", "SCHEDULING"}
TASK_INTENTS = {"ACTION_REQUIRED", "URGENT", "SCHEDULING"}
LOW_VALUE_MARKERS = (
    "unsubscribe",
    "manage preferences",
    "view in browser",
    "newsletter",
    "weekly digest",
    "daily digest",
    "marketing",
    "promotion",
    "promotional",
    "sale",
    "discount",
    "coupon",
    "special offer",
    "limited time",
    "subscribe",
    "subscription",
    "product update",
    "webinar",
    "announcement",
)
ACTION_MARKERS = (
    "please review",
    "approve",
    "approval",
    "confirm",
    "sign",
    "schedule",
    "meeting",
    "deadline",
    "due",
    "question",
    "follow up",
)
SOCIAL_NOTIFICATION_MARKERS = (
    "linkedin",
    "invited you to connect",
    "connection request",
    "accept or decline",
    "view profile",
    "new follower",
    "started following you",
    "commented on your post",
    "liked your post",
    "mentioned you",
)
STALE_WORKFLOW_DAYS = 14


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Public entry point
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def process_thread_intelligence(
    thread_id: str,
    user_id: str,
    db: AsyncSession,
) -> Optional[dict]:
    """
    Full intelligence pipeline for one thread.
    Safe to call in background â€” never raises, always returns.
    """
    lock_acquired = False
    redis_client = None
    lock_key = f"intel:inflight:{user_id}:{thread_id}"
    lock_token = str(uuid.uuid4())
    record_metric("intel_request")

    try:
        # â”€â”€ 1. Load thread â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        thread = await _load_thread(thread_id, user_id, db)
        if not thread:
            return None

        redis_client, lock_acquired = await _acquire_intel_lock(lock_key, lock_token)
        if not lock_acquired:
            record_metric("intel_lock_contended")
            logger.debug(f"Thread {thread_id} intel already in progress, skipping duplicate run")
            return None

        # Skip if already processed recently (< 24h)
        if thread.intel_generated_at:
            age = (datetime.now(timezone.utc) - thread.intel_generated_at).total_seconds() / 3600
            if age < 24:
                record_metric("intel_skipped_fresh")
                logger.debug(f"Thread {thread_id} intel fresh, skipping")
                return None

        # â”€â”€ 2. Load messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        messages = await _load_messages(thread_id, db)

        low_value_reason = _detect_low_value_thread(thread, messages)
        if low_value_reason:
            record_metric("intel_skipped_low_value")
            final_intel = _build_low_value_intel(thread, low_value_reason)
            thread.summary = final_intel["summary"]
            thread.intent = final_intel["intent"]
            thread.urgency_score = final_intel["urgency_score"]
            thread.intel_json = final_intel
            thread.intel_generated_at = datetime.now(timezone.utc)

            await _process_contacts(user_id, messages, db)
            await db.commit()
            logger.info(f"Intel skipped for low-value thread={thread_id} reason={low_value_reason}")
            await _publish_intel_ready(user_id, thread_id, final_intel)
            return final_intel

        # â”€â”€ 3. Single Gemini Flash call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        raw_intel = await run_intelligence(
            thread_id=thread_id,
            subject=thread.subject or "",
            participants=list(thread.participants or []),
            messages=messages,
        )

        # â”€â”€ 4. Module extraction (pure functions, no LLM calls) â”€â”€â”€â”€â”€â”€â”€
        summary          = extract_summary(raw_intel)
        key_points       = extract_key_points(raw_intel)
        suggested_action = extract_suggested_action(raw_intel)

        intent, urgency_score  = extract_intent(raw_intel)
        priority_level         = extract_priority_level(raw_intel)
        follow_up, reply_by    = should_follow_up(raw_intel)

        deadlines              = extract_deadlines(raw_intel)
        entities               = extract_entities(raw_intel)
        action_items           = extract_action_items(raw_intel)
        tags_list              = extract_tags(raw_intel)
        suggested_draft        = extract_suggested_draft(raw_intel)
        should_create_reply    = _coerce_optional_bool(raw_intel.get("should_create_reply"))
        should_create_tasks    = _coerce_optional_bool(raw_intel.get("should_create_tasks"))

        if should_create_reply is None:
            should_create_reply = intent in REPLY_INTENTS and not _is_low_value_intent(intent)
        if should_create_tasks is None:
            should_create_tasks = intent in TASK_INTENTS and bool(action_items) and not _is_low_value_intent(intent)

        if not should_create_reply:
            suggested_draft = None
        if not should_create_tasks:
            action_items = []

        stale_workflow_reason = _stale_workflow_reason(thread)
        if stale_workflow_reason:
            should_create_reply = False
            should_create_tasks = False
            suggested_draft = None
            action_items = []

        workflow_reason = stale_workflow_reason or raw_intel.get("workflow_reason") or _build_workflow_reason(
            intent=intent,
            should_create_reply=should_create_reply,
            should_create_tasks=should_create_tasks,
            action_items_count=len(action_items),
        )

        # â”€â”€ 5. Assemble final intel dict â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        final_intel = {
            **raw_intel,                          # keep all Gemini fields
            "summary"          : summary,
            "key_points"       : key_points,
            "suggested_action" : suggested_action,
            "intent"           : intent,
            "urgency_score"    : urgency_score,
            "should_create_reply": bool(should_create_reply),
            "should_create_tasks": bool(should_create_tasks),
            "is_promotional"   : _coerce_bool(raw_intel.get("is_promotional")),
            "is_subscription"  : _coerce_bool(raw_intel.get("is_subscription")),
            "workflow_reason"  : workflow_reason,
            "priority_level"   : priority_level,
            "follow_up_needed" : follow_up,
            "expected_reply_by": reply_by,
            "deadlines"        : deadlines,
            "entities"         : entities,
            "action_items"     : action_items,
            "tags"             : tags_list,
            "suggested_draft"  : suggested_draft,
            "processed_at"     : datetime.now(timezone.utc).isoformat(),
        }

        # â”€â”€ 6. Persist intel to Thread model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        thread.summary              = summary
        thread.intent               = intent
        thread.urgency_score        = urgency_score
        thread.intel_json           = final_intel
        thread.intel_generated_at   = datetime.now(timezone.utc)
        
        # â”€â”€ 6a. Process Contacts FIRST (so tags can be linked) â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await _process_contacts(user_id, messages, db)

        # â”€â”€ 6b. Process Tags (Gemini tags + Contact tags) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await _process_tags(user_id, thread, tags_list, db)

        # â”€â”€ 6c. Process Suggested Draft â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if should_create_reply and suggested_draft:
            await _create_draft(user_id, thread_id, suggested_draft, db)

        await db.commit()
        logger.info(f"Intel saved: thread={thread_id} intent={intent} score={urgency_score}")

        # â”€â”€ 6.5 Embed thread into ChromaDB if valuable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        from core.intelligence.embedding_strategy import embed_thread_if_valuable
        messages_text = "\n".join([m.get("body", "") for m in messages])
        await embed_thread_if_valuable(thread, user_id, messages_text, db)

        # â”€â”€ 6.7 Check if sender is unsubscribed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        # If the thread sender is unsubscribed, skip auto-creating tasks.
        is_unsubscribed = False
        import re
        email_regex = re.compile(r"<([^>]+)>|([^\s<>]+@[^\s<>]+)")
        for p in list(thread.participants or []):
            match = email_regex.search(p)
            if match:
                email = (match.group(1) or match.group(2)).lower()
                stmt_unsub = select(Contact.is_unsubscribed).where(
                    Contact.user_id == user_id, 
                    Contact.email_address == email
                )
                if (await db.execute(stmt_unsub)).scalar():
                    is_unsubscribed = True
                    break

        # â”€â”€ 7. Auto-create Tasks from action items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if not is_unsubscribed and should_create_tasks:
            for item in action_items:
                await _create_task(user_id, thread_id, item, db)

        # â”€â”€ 8. Publish SSE event â†’ frontend invalidates cache â”€â”€â”€â”€â”€â”€â”€â”€â”€
        await _publish_intel_ready(user_id, thread_id, final_intel)
        record_metric("intel_completed")

        return final_intel

    except Exception as exc:
        record_metric("intel_failed")
        await db.rollback()
        logger.error(f"Intel pipeline failed for {thread_id}: {exc}", exc_info=True)
        return None
    finally:
        if lock_acquired:
            await _release_intel_lock(redis_client, lock_key, lock_token)


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Helpers
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def _load_thread(thread_id: str, user_id: str, db: AsyncSession) -> Optional[Thread]:
    """Load thread with tags eagerly to avoid lazy-load in async context."""
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Thread)
        .where(Thread.id == thread_id, Thread.user_id == user_id)
        .options(selectinload(Thread.tags))
    )
    return (await db.execute(stmt)).scalars().first()


async def _load_messages(thread_id: str, db: AsyncSession) -> list[dict]:
    from models.email import Email
    stmt = select(Email).where(Email.thread_id == thread_id).order_by(Email.received_at)
    rows = (await db.execute(stmt)).scalars().all()
    return [
        {
            "from": m.sender,
            "date": m.sent_at.isoformat() if m.sent_at else m.received_at.isoformat() if m.received_at else "",
            "body": (m.body_plain or m.body_html or "")[:2000],
            "is_from_user": bool(m.is_from_user),
        }
        for m in rows
    ]


def _detect_low_value_thread(thread: Thread, messages: list[dict]) -> Optional[str]:
    """Return a short reason when the thread looks promotional or subscription-like."""
    parts = [thread.subject or "", " ".join(thread.participants or [])]
    parts.extend(msg.get("body", "") for msg in messages[:3])
    text = " ".join(parts).lower()

    if any(marker in text for marker in ("unsubscribe", "manage preferences", "view in browser", "newsletter", "weekly digest", "daily digest")):
        if not any(marker in text for marker in ACTION_MARKERS):
            return "promotional_or_subscription"

    if any(marker in text for marker in LOW_VALUE_MARKERS):
        if not any(marker in text for marker in ACTION_MARKERS):
            return "marketing_blast"

    if any(marker in text for marker in ("no-reply", "noreply", "do-not-reply")) and any(marker in text for marker in ("newsletter", "promotion", "sale", "discount", "coupon", "special offer", "unsubscribe")):
        return "no_reply_marketing_mail"

    if any(marker in text for marker in SOCIAL_NOTIFICATION_MARKERS):
        return "social_notification"

    return None


def _build_low_value_intel(thread: Thread, reason: str) -> dict:
    subject = thread.subject or "(No Subject)"
    intent = "NEWSLETTER" if "subscription" in reason or "newsletter" in reason else "FYI"
    if reason == "social_notification":
        intent = "SOCIAL"
    summary = f"Low-value email: {subject}"

    if reason == "promotional_or_subscription":
        summary = f"Newsletter or subscription update: {subject}"
    elif reason == "marketing_blast":
        summary = f"Promotional email: {subject}"
    elif reason == "social_notification":
        summary = f"Social notification: {subject}"

    return {
        "thread_id": thread.id,
        "summary": summary,
        "intent": intent,
        "urgency_score": 0,
        "should_create_reply": False,
        "should_create_tasks": False,
        "is_promotional": True,
        "is_subscription": intent == "NEWSLETTER",
        "workflow_reason": reason,
        "main_ask": None,
        "decision_needed": None,
        "extracted_deadlines": [],
        "entities": [],
        "attachment_summaries": [],
        "suggested_action": None,
        "suggested_reply_points": [],
        "key_points": [],
        "deadlines": [],
        "tags": ["Newsletter"] if intent == "NEWSLETTER" else (["Social"] if intent == "SOCIAL" else ["Promotional"]),
        "action_items": [],
        "suggested_draft": None,
        "follow_up_needed": False,
        "expected_reply_by": None,
        "priority_level": "low",
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "schema_version": "heuristic-low-value",
        "model": "heuristic-low-value",
    }


def _is_low_value_intent(intent: str) -> bool:
    return intent in {"FYI", "NEWSLETTER", "SOCIAL", "OTHER", "UNKNOWN"}


def _build_workflow_reason(
    intent: str,
    should_create_reply: bool,
    should_create_tasks: bool,
    action_items_count: int,
) -> str:
    if _is_low_value_intent(intent):
        return "Informational mail only; no workflow action needed."
    if should_create_reply and should_create_tasks:
        return f"Actionable thread with {action_items_count} task(s) and a reply needed."
    if should_create_reply:
        return "Reply needed, but no task should be created."
    if should_create_tasks:
        return f"Task-only thread with {action_items_count} task(s)."
    return "No workflow action needed."


def _stale_workflow_reason(thread: Thread) -> Optional[str]:
    """Disable auto-workflow for stale threads to avoid noise during backfills/redeploys."""
    if not thread.last_email_at:
        return None
    now = datetime.now(timezone.utc)
    age_days = (now - thread.last_email_at).total_seconds() / 86400
    if age_days >= STALE_WORKFLOW_DAYS:
        return f"Thread is {int(age_days)} days old; auto-workflow suppressed."
    return None


def _coerce_optional_bool(value) -> Optional[bool]:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "1"}:
            return True
        if lowered in {"false", "no", "0", "null", "none", ""}:
            return False
    return bool(value)


def _coerce_bool(value) -> bool:
    return bool(_coerce_optional_bool(value))


async def _acquire_intel_lock(lock_key: str, token: str) -> tuple[Optional[object], bool]:
    """Acquire a short-lived Redis lock to avoid duplicate model calls."""
    try:
        from core.redis import get_redis
        r = await get_redis()
        acquired = await r.set(lock_key, token, ex=180, nx=True)
        return r, bool(acquired)
    except Exception:
        # If Redis is unavailable, do not block processing.
        return None, True


async def _release_intel_lock(redis_client, lock_key: str, token: str) -> None:
    """Best-effort lock release with token check to avoid deleting others' locks."""
    if not redis_client:
        return
    try:
        current_token = await redis_client.get(lock_key)
        if current_token == token:
            await redis_client.delete(lock_key)
    except Exception:
        pass


_PRIORITY_MAP = {
    "urgent": ("DO_NOW", 90),
    "high"  : ("DO_NOW", 80),
    "medium": ("DO_TODAY", 55),
    "low"   : ("CAN_WAIT", 20),
}


async def _process_tags(user_id: str, thread: Thread, tags_list: list[str], db: AsyncSession) -> None:
    """Get or create tags and attach them to the thread. Also propagates contact tags."""
    # 1. Add tags suggested by Gemini
    if tags_list:
        for tag_name in tags_list:
            if not tag_name:
                continue
            
            stmt = select(Tag).where(Tag.user_id == user_id, Tag.name.ilike(tag_name))
            existing_tag = (await db.execute(stmt)).scalars().first()
            
            if not existing_tag:
                existing_tag = Tag(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    name=tag_name,
                    is_auto_applied=True
                )
                db.add(existing_tag)
                
            if existing_tag not in thread.tags:
                thread.tags.append(existing_tag)
                
    # 2. Add tags from the thread's contacts (CRM propagation)
    from sqlalchemy.orm import selectinload
    import re
    email_regex = re.compile(r"<([^>]+)>|([^\s<>]+@[^\s<>]+)")
    
    # Seen participants to avoid redundant DB lookups
    seen_emails = set()
    for participant in (thread.participants or []):
        match = email_regex.search(participant)
        if not match: continue
        email = (match.group(1) or match.group(2)).lower()
        if email in seen_emails: continue
        seen_emails.add(email)
        
        stmt = select(Contact).where(
            Contact.user_id == user_id, 
            Contact.email_address == email
        ).options(selectinload(Contact.tags))
        contact = (await db.execute(stmt)).scalars().first()
        
        if contact and contact.tags:
            for tag in contact.tags:
                if tag not in thread.tags:
                    thread.tags.append(tag)
                    logger.debug(f"Propagated contact tag '{tag.name}' to thread {thread.id}")


async def _process_contacts(user_id: str, messages: list[dict], db: AsyncSession) -> None:
    """Extract email addresses from message senders and update/create Contacts."""
    import re
    from collections import Counter
    # Match text between < > or match full string if it's just an email
    email_regex = re.compile(r"<([^>]+)>|([^\s<>]+@[^\s<>]+)")
    
    # Count occurrences per sender
    sender_counts = Counter()
    sender_full_names = {}

    for msg in messages:
        if msg.get("is_from_user"):
            continue
        
        participant = msg.get("from", "")
        match = email_regex.search(participant)
        if match:
            email = (match.group(1) or match.group(2)).lower()
            if email:
                sender_counts[email] += 1
                sender_full_names[email] = participant

    for email, count in sender_counts.items():
        stmt = select(Contact).where(Contact.user_id == user_id, Contact.email_address == email)
        contact = (await db.execute(stmt)).scalars().first()
        
        full_name = sender_full_names[email]
        if contact:
            contact.interaction_count += count
            contact.last_interaction_at = datetime.now(timezone.utc)
            contact.updated_at = datetime.now(timezone.utc)
        else:
            contact = Contact(
                id=str(uuid.uuid4()),
                user_id=user_id,
                email_address=email,
                name=full_name.split("<")[0].strip() if "<" in full_name else None,
                interaction_count=count,
                last_interaction_at=datetime.now(timezone.utc)
            )
            db.add(contact)


async def _create_draft(user_id: str, thread_id: str, content: str, db: AsyncSession) -> None:
    """Auto-create a Draft reply from Gemini's suggestion."""
    # Dedup Check: Avoid creating multiple AUTO generated drafts per thread
    stmt = select(Draft).where(
        Draft.user_id == user_id, 
        Draft.thread_id == thread_id,
        Draft.status == DraftStatus.GENERATED.value
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        return
        
    draft = Draft(
        id=str(uuid.uuid4()),
        user_id=user_id,
        thread_id=thread_id,
        subject="Re: Thread", # Placeholder, relies on frontend to pull thread subject
        content=content,
        body=content,
        tone=DraftTone.NORMAL.value,
        generation_model="llama-3.3-70b-instruct",
        status=DraftStatus.GENERATED.value
    )
    db.add(draft)
    record_metric("auto_draft_created")
    logger.info(f"Auto-draft created for thread={thread_id}")


async def _create_task(
    user_id: str,
    thread_id: str,
    item: dict,
    db: AsyncSession,
) -> None:

    """Create a Task from an action item. Idempotent â€” skips if duplicate exists."""
    title = item.get("title", "")
    if not title:
        return
        
    # Dedup check
    existing = (await db.execute(
        select(Task).where(
            Task.user_id == user_id,
            Task.source_thread_id == thread_id,
            Task.title == title,
        )
    )).scalars().first()
    if existing:
        return

    priority_str = (item.get("priority") or "medium").lower()
    priority_value, priority_score = _PRIORITY_MAP.get(priority_str, ("DO_TODAY", 55))

    # Parse due_date
    due_date = None
    raw_due = item.get("due_date")
    if raw_due and raw_due.lower() != "null":
        try:
            from datetime import date
            due_date = datetime.strptime(raw_due, "%Y-%m-%d").date()
        except ValueError:
            pass

    raw_type = (item.get("task_type") or "REPLY").upper()
    ALLOWED_TASK_TYPES = {"REPLY", "REVIEW", "SCHEDULE", "FOLLOWUP", "OTHER"}
    
    if raw_type not in ALLOWED_TASK_TYPES:
        logger.warning(f"Invalid task type '{raw_type}', defaulting to '{TaskType.REPLY.value}'")
        final_task_type = TaskType.REPLY
    else:
        final_task_type = TaskType(raw_type)
    logger.debug(f"raw_type: {raw_type}")
    logger.debug(f"final_task_type enum: {final_task_type}")
    logger.debug(f"value being inserted: {final_task_type.value}")

    task = Task(
        id=str(uuid.uuid4()),
        user_id=user_id,
        source_thread_id=thread_id,
        title=title,
        description=item.get("description"),
        task_type=final_task_type,
        priority_level=priority_value,
        priority_score=priority_score,
        due_date=due_date,
        status=TaskStatus.PENDING,
        source_type="ai_generated",
        ai_confidence=85,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    try:
        db.add(task)
        await db.commit()
        record_metric("auto_task_created")
        logger.info(f"Auto-task created: '{title}' (thread={thread_id})")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create auto-task '{title}': {e}")


async def _publish_intel_ready(user_id: str, thread_id: str, intel: dict) -> None:
    """Best-effort SSE publish via Redis pub/sub."""
    try:
        import json
        from core.redis import get_redis
        r = await get_redis()
        if not r:
            return
        payload = json.dumps({
            "type"              : "intel_ready",
            "thread_id"         : thread_id,
            "summary"           : (intel.get("summary") or "")[:120],
            "intent"            : intel.get("intent"),
            "urgency_score"     : intel.get("urgency_score", 0),
            "action_items_count": len(intel.get("action_items") or []),
        })
        await r.publish(f"user:{user_id}:events", payload)
    except Exception as e:
        logger.debug(f"SSE publish skipped: {e}")
