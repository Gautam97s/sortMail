"""
Bedrock Nova Intelligence Engine.
"""

from __future__ import annotations

import json
import logging
import re
import time
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.config import Config

from app.config import settings
from core.app_metrics import record_ai_usage, record_metric
from core.intelligence.prompts import (
    ATTACHMENT_ANALYSIS_SYSTEM_PROMPT,
    CHAT_SYSTEM_PROMPT,
    DRAFT_REPLY_SYSTEM_PROMPT,
    DRAFT_REPLY_USER_PROMPT_TEMPLATE,
    FREEFORM_DRAFT_SYSTEM_PROMPT,
    FREEFORM_DRAFT_USER_PROMPT_TEMPLATE,
    THREAD_INTEL_SYSTEM_PROMPT,
    THREAD_INTEL_USER_PROMPT_TEMPLATE,
)

logger = logging.getLogger(__name__)


def _get_bedrock_client():
    region = settings.BEDROCK_REGION_NAME or settings.AWS_REGION_NAME or "us-east-1"
    return boto3.client(
        "bedrock-runtime",
        region_name=region,
        config=Config(read_timeout=3600, retries={"max_attempts": 3, "mode": "adaptive"}),
    )


def _normalize_message_content(content: Any) -> list[dict[str, Any]]:
    if isinstance(content, list):
        normalized: list[dict[str, Any]] = []
        for item in content:
            if isinstance(item, dict) and ("text" in item or "image" in item or "document" in item):
                normalized.append(item)
        if normalized:
            return normalized
        return [{"text": json.dumps(content, ensure_ascii=False)}]

    if content is None:
        return [{"text": ""}]

    return [{"text": str(content)}]


def _split_messages(messages: list[dict]) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    system_texts: list[str] = []
    bedrock_messages: list[dict[str, Any]] = []

    for message in messages:
        role = (message.get("role") or "user").strip().lower()
        content = message.get("content")

        if role == "system":
            if isinstance(content, list):
                system_texts.extend(
                    str(block.get("text", "")).strip()
                    for block in content
                    if isinstance(block, dict) and block.get("text")
                )
            elif content:
                system_texts.append(str(content).strip())
            continue

        bedrock_messages.append({"role": role, "content": _normalize_message_content(content)})

    system_blocks = [{"text": text} for text in system_texts if text]
    return system_blocks, bedrock_messages


def _extract_text(response: dict[str, Any]) -> str:
    content_list = response.get("output", {}).get("message", {}).get("content", [])
    text_parts: list[str] = []
    for content in content_list:
        if isinstance(content, dict) and content.get("text"):
            text_parts.append(str(content["text"]))
    return "".join(text_parts).strip()


def _extract_usage(response: dict[str, Any]) -> tuple[int, int]:
    usage = response.get("usage") or {}
    input_tokens = usage.get("inputTokens") or usage.get("input_tokens") or usage.get("promptTokens") or 0
    output_tokens = usage.get("outputTokens") or usage.get("output_tokens") or usage.get("completionTokens") or 0
    return int(input_tokens or 0), int(output_tokens or 0)


def _truncate_messages(messages: list[dict], max_message_count: int = 4, max_chars_per_message: int = 1200) -> list[dict]:
    if len(messages) <= max_message_count:
        selected = messages
    else:
        head_count = max_message_count // 2
        tail_count = max_message_count - head_count
        selected = messages[:head_count] + messages[-tail_count:]

    truncated: list[dict] = []
    for message in selected:
        body = (message.get("body") or message.get("body_plain") or message.get("body_html") or "")
        truncated.append(
            {
                "from": message.get("from") or message.get("sender") or "",
                "date": message.get("date") or "",
                "body": str(body)[:max_chars_per_message],
            }
        )
    return truncated


async def _call_llama(
    messages: list[dict],
    max_tokens: int = 2048,
    temperature: float = 0.2,
    operation: str = "general",
) -> str:
    """Call Amazon Bedrock Nova via the Converse API."""
    model_id = settings.BEDROCK_MODEL_ID
    record_metric("ai_call_attempt")
    record_metric(f"ai_call_attempt_{operation}")
    start = time.perf_counter()

    try:
        system_blocks, bedrock_messages = _split_messages(messages)
        request_kwargs: dict[str, Any] = {
            "modelId": model_id,
            "messages": bedrock_messages,
            "inferenceConfig": {
                "maxTokens": max_tokens,
                "temperature": temperature,
                "topP": 0.9,
            },
        }
        if system_blocks:
            request_kwargs["system"] = system_blocks

        response = _get_bedrock_client().converse(**request_kwargs)
        text = _extract_text(response)
        input_tokens, output_tokens = _extract_usage(response)
        latency_ms = int((time.perf_counter() - start) * 1000)
        call_ref = record_ai_usage(
            operation=operation,
            model_id=model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
        )
        record_metric("ai_call_success")
        record_metric(f"ai_call_success_{operation}")
        logger.info(
            "Bedrock AI call success ref=%s op=%s model=%s in=%s out=%s latency_ms=%s",
            call_ref,
            operation,
            model_id,
            input_tokens,
            output_tokens,
            latency_ms,
        )
        return text
    except Exception as exc:
        latency_ms = int((time.perf_counter() - start) * 1000)
        record_metric("ai_call_error")
        record_metric(f"ai_call_error_{operation}")
        record_ai_usage(
            operation=operation,
            model_id=model_id,
            input_tokens=0,
            output_tokens=0,
            status="error",
            latency_ms=latency_ms,
            metadata={"error": str(exc)[:300]},
        )
        logger.error("Bedrock AI call failed op=%s model=%s: %s", operation, model_id, exc)
        raise


async def run_intelligence(
    thread_id: str,
    subject: str,
    participants: list[str],
    messages: list[dict],
) -> dict:
    """Run Bedrock Nova intelligence on a thread."""
    selected_messages = _truncate_messages(messages, max_message_count=4, max_chars_per_message=1200)
    messages_text = ""
    for msg in selected_messages:
        messages_text += (
            f"<message>\n"
            f"  <from>{msg.get('from', '')}</from>\n"
            f"  <date>{msg.get('date', '')}</date>\n"
            f"  <body>{msg.get('body', '')}</body>\n"
            f"</message>\n"
        )

    user_content = THREAD_INTEL_USER_PROMPT_TEMPLATE.format(
        subject=subject or "(No Subject)",
        participants=", ".join(participants[:10]),
        messages=messages_text,
    )

    chat_messages = [
        {"role": "system", "content": THREAD_INTEL_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    for attempt in range(4):
        try:
            raw = await _call_llama(chat_messages, operation="thread_intel")
            raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.DOTALL).strip()
            json_match = re.search(r"\{.*\}", raw, re.DOTALL)
            if json_match:
                raw = json_match.group(0)

            intel = json.loads(raw)
            intel["thread_id"] = thread_id
            intel["processed_at"] = datetime.now(timezone.utc).isoformat()
            intel["schema_version"] = settings.BEDROCK_MODEL_ID
            intel["model"] = settings.BEDROCK_MODEL_ID
            return intel
        except json.JSONDecodeError as exc:
            record_metric("ai_json_parse_error")
            logger.warning("Bedrock JSON parse failed attempt %s/4 for %s: %s", attempt + 1, thread_id, exc)
            if attempt == 3:
                record_metric("ai_fallback_used")
                return _fallback_intel(subject, thread_id)
        except Exception as exc:
            logger.warning("Bedrock intelligence failed attempt %s/4 for %s: %s", attempt + 1, thread_id, exc)
            if attempt == 3:
                record_metric("ai_fallback_used")
                return _fallback_intel(subject, thread_id)

    record_metric("ai_fallback_used")
    return _fallback_intel(subject, thread_id)


async def llama_chat(
    messages: list[dict],
    system_prompt: str = CHAT_SYSTEM_PROMPT,
    max_tokens: int = 1024,
) -> str:
    """General-purpose chat completion using Bedrock Nova."""
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    try:
        record_metric("ai_chat_request")
        return await _call_llama(full_messages, max_tokens=max_tokens, temperature=0.7, operation="chat")
    except Exception as exc:
        record_metric("ai_chat_error")
        logger.error("Bedrock chat failed: %s", exc)
        return "I'm sorry, I couldn't process your request right now. Please try again."


def _fallback_intel(subject: str, thread_id: str) -> dict:
    return {
        "thread_id": thread_id,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "summary": f"Email thread: {subject or '(No Subject)'}",
        "intent": "FYI",
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


def _prompt_for_draft_reply(tone: str, instruction: str, thread_context: str) -> str:
    return DRAFT_REPLY_USER_PROMPT_TEMPLATE.format(
        tone=tone,
        instruction=instruction,
        thread_context=thread_context,
    )


def _prompt_for_freeform_draft(recipient_context: str, subject: str, tone: str, instruction: str) -> str:
    return FREEFORM_DRAFT_USER_PROMPT_TEMPLATE.format(
        recipient_context=recipient_context,
        subject=subject,
        tone=tone,
        instruction=instruction,
    )


def _prompt_for_attachment_analysis(document_text: str) -> str:
    return f"{ATTACHMENT_ANALYSIS_SYSTEM_PROMPT}\n\n{document_text}".strip()
