"""
Llama Intelligence Engine
--------------------------
Uses Llama 3.3 70B via Hugging Face Inference API for all AI intelligence.
Gemini is kept ONLY for embeddings (see core/rag/embeddings.py).

Why HF Inference API instead of local loading:
  Llama 3.3 70B requires ~140GB VRAM to run locally.
  HF serverless inference runs it on HF's GPU fleet — no local GPU needed.

Docs: https://huggingface.co/docs/huggingface_hub/guides/inference
"""

import json
import re
import logging
import asyncio
from datetime import datetime, timezone
from core.app_metrics import record_metric

logger = logging.getLogger(__name__)

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert email analyst. Extract structured intelligence from email threads.
Always respond with valid JSON only. No markdown fences, no explanation text outside JSON."""

USER_PROMPT_TEMPLATE = """Analyze this email thread and extract actionable intelligence.

WORKFLOW GUARDRAILS:
- If the thread is a social-network notification (LinkedIn, X/Twitter, Instagram, Facebook, etc.), set:
    - "intent" to "social" or "fyi"
    - "should_create_reply" to false
    - "should_create_tasks" to false
    - "action_items" to []
    - "suggested_draft" to null
- If the thread is newsletter, promotional, digest, or subscription updates, also keep workflow flags false.
- Do NOT create tasks for passive notifications like "connection request", "someone viewed your profile", "new follower", "weekly digest".

<email_thread>
<subject>{subject}</subject>
<participants>{participants}</participants>
<messages>
{messages}
</messages>
</email_thread>

Respond ONLY with this JSON structure (no markdown, no extra text):
{{
  "summary": "2-3 sentence executive summary",
  "intent": "action_required|fyi|scheduling|urgent|question|social|newsletter|other",
  "urgency_score": 0,
  "urgency_reason": "Why this urgency score?",
    "main_ask": "What the sender is asking the user to do, or null",
    "decision_needed": "The decision the user must make, or null",
  "sentiment": "positive|neutral|negative|mixed",
    "should_create_reply": true,
    "should_create_tasks": true,
    "is_promotional": false,
    "is_subscription": false,
    "workflow_reason": "Why this thread does or does not need a reply or task",
  "key_points": ["point 1", "point 2"],
  "action_items": [
    {{
      "task": "What to do",
      "title": "Short task title",
      "description": "More detail",
      "owner": "YOU or THEM",
      "deadline": "YYYY-MM-DD or null",
      "due_date": "YYYY-MM-DD or null",
      "priority": "urgent|high|medium|low",
      "task_type": "general|email|follow_up|meeting"
    }}
  ],
  "entities": {{
    "people": [],
    "companies": [],
    "dates": [],
    "amounts": []
  }},
  "follow_up_needed": true,
  "reply_deadline": "YYYY-MM-DD or null",
  "topics": ["budget", "contract"],
  "tags": ["Invoice", "Meeting"],
    "suggested_draft": "Only write a concise, professional reply when a reply is actually needed. Otherwise null.",
  "meeting_detected": {{
    "has_meeting": false,
    "date": "YYYY-MM-DD or null",
    "time": "HH:MM or null",
    "location": "string or null"
  }}
}}

CRITICAL: Only use information from the email. Do not hallucinate."""


# ── Client ────────────────────────────────────────────────────────────────────

def _get_hf_client():
    """Lazy-initialise the HF InferenceClient."""
    from huggingface_hub import InferenceClient
    from app.config import settings
    return InferenceClient(
        model="meta-llama/Llama-3.3-70B-Instruct",
        token=settings.HF_TOKEN,
    )


# ── Inference ─────────────────────────────────────────────────────────────────

async def _call_llama(messages: list[dict], max_tokens: int = 2048, temperature: float = 0.2) -> str:
    """Call Llama 3.3 70B via HF Inference API (async-wrapped)."""
    from app.config import settings
    record_metric("llm_call_attempt")

    if not settings.HF_TOKEN:
        raise RuntimeError("HF_TOKEN not configured — cannot call Llama 3.3 70B.")

    def _sync_call():
        client = _get_hf_client()
        # chat_completion returns an openai-compatible response
        response = client.chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        record_metric("llm_call_success")
        return response.choices[0].message.content

    return await asyncio.to_thread(_sync_call)


# ── Main entry point ──────────────────────────────────────────────────────────

async def run_intelligence(
    thread_id: str,
    subject: str,
    participants: list[str],
    messages: list[dict],
) -> dict:
    """
    Run Llama 3.3 70B intelligence on a thread.
    Returns a parsed dict that is drop-in compatible with the old Gemini output.
    """
    # Build messages XML block (trim long bodies, escape XML special chars)
    messages_xml = ""
    for msg in messages[:10]:
        body = (msg.get("body") or "")[:2000]
        body = body.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        messages_xml += (
            f"<message>\n"
            f"  <from>{msg.get('from', '')}</from>\n"
            f"  <date>{msg.get('date', '')}</date>\n"
            f"  <body>{body}</body>\n"
            f"</message>\n"
        )

    user_content = USER_PROMPT_TEMPLATE.format(
        subject=subject or "(No Subject)",
        participants=", ".join(participants[:10]),
        messages=messages_xml,
    )

    chat_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    for attempt in range(4):
        try:
            raw = await _call_llama(chat_messages)

            # Strip any accidental markdown fences
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.DOTALL).strip()
            # Extract JSON if there's surrounding text
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                raw = json_match.group(0)

            intel = json.loads(raw)
            intel["thread_id"] = thread_id
            intel["processed_at"] = datetime.now(timezone.utc).isoformat()
            intel["schema_version"] = "llama-3.3-70b-instruct"
            intel["model"] = "llama-3.3-70b-instruct"

            logger.info(
                f"Llama intel generated: thread={thread_id} "
                f"intent={intel.get('intent')} score={intel.get('urgency_score')}"
            )
            return intel

        except json.JSONDecodeError as e:
            record_metric("llm_json_parse_error")
            logger.warning(f"Llama JSON parse failed attempt {attempt+1}/{4} for {thread_id}: {e}")
            if attempt == 3:
                logger.error(f"Llama JSON parse failed after 4 attempts for {thread_id}")
                record_metric("llm_fallback_used")
                return _fallback_intel(subject, thread_id)
            await asyncio.sleep(1)

        except Exception as e:
            record_metric("llm_call_error")
            error_str = str(e)
            logger.warning(f"Llama call failed attempt {attempt+1}/4 for {thread_id}: {error_str}")

            if "429" in error_str or "rate" in error_str.lower():
                wait = 2 ** attempt
                logger.warning(f"Rate limited — waiting {wait}s")
                await asyncio.sleep(wait)
                continue

            if attempt == 3:
                logger.error(f"Llama failed after 4 attempts for {thread_id}: {error_str}")
                record_metric("llm_fallback_used")
                return _fallback_intel(subject, thread_id)

            await asyncio.sleep(1)

    record_metric("llm_fallback_used")
    return _fallback_intel(subject, thread_id)


# ── Chat completion (for /api/ai/chat chatbot) ────────────────────────────────

async def llama_chat(
    messages: list[dict],
    system_prompt: str = "You are the SortMail AI assistant. Help concisely and professionally.",
    max_tokens: int = 1024,
) -> str:
    """
    General-purpose chat completion using Llama 3.3 70B.
    messages: list of {role, content} dicts.
    Returns the assistant's text response.
    """
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    try:
        record_metric("llm_chat_request")
        return await _call_llama(full_messages, max_tokens=max_tokens, temperature=0.7)
    except Exception as e:
        record_metric("llm_chat_error")
        logger.error(f"Llama chat failed: {e}")
        return "I'm sorry, I couldn't process your request right now. Please try again."


# ── Fallback ──────────────────────────────────────────────────────────────────

def _fallback_intel(subject: str, thread_id: str) -> dict:
    """Return minimal safe intel when Llama fails."""
    return {
        "thread_id": thread_id,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "summary": f"Email thread: {subject or '(No Subject)'}",
        "intent": "fyi",
        "urgency_score": 10,
        "should_create_reply": False,
        "should_create_tasks": False,
        "is_promotional": False,
        "is_subscription": False,
        "workflow_reason": "Fallback analysis only",
        "sentiment": "neutral",
        "key_points": [],
        "action_items": [],
        "entities": {"people": [], "companies": [], "dates": [], "amounts": []},
        "follow_up_needed": False,
        "reply_deadline": None,
        "topics": [],
        "tags": [],
        "suggested_draft": None,
        "meeting_detected": {"has_meeting": False},
        "schema_version": "fallback",
        "model": "fallback",
    }
