"""
In-process App Metrics
----------------------
Lightweight rolling counters for operational visibility.
"""

from __future__ import annotations

from collections import Counter, deque
from datetime import datetime, timezone
from threading import Lock
from time import monotonic
from typing import Any
from uuid import uuid4

_WINDOW_SECONDS = 60.0
_recent_events: deque[tuple[float, str]] = deque()
_lifetime_events: Counter[str] = Counter()
_recent_ai_calls: deque[tuple[float, dict[str, Any]]] = deque()
_ai_lifetime: Counter[str] = Counter()
_lock = Lock()


def record_metric(event: str, count: int = 1) -> None:
    """Record an event count for rolling and lifetime metrics."""
    if count <= 0:
        return

    key = (event or "unknown_event").strip().lower()
    now = monotonic()

    with _lock:
        for _ in range(count):
            _recent_events.append((now, key))
        _lifetime_events[key] += count
        _trim_locked(now)


def record_ai_usage(
    *,
    operation: str,
    model_id: str,
    input_tokens: int = 0,
    output_tokens: int = 0,
    call_ref: str | None = None,
    status: str = "success",
    latency_ms: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> str:
    """Record structured AI usage with a stable reference id."""
    ref = (call_ref or uuid4().hex[:12]).lower()
    now = monotonic()

    safe_input = max(int(input_tokens or 0), 0)
    safe_output = max(int(output_tokens or 0), 0)
    total_tokens = safe_input + safe_output

    record = {
        "call_ref": ref,
        "operation": (operation or "unknown").strip().lower(),
        "model_id": (model_id or "unknown").strip(),
        "input_tokens": safe_input,
        "output_tokens": safe_output,
        "total_tokens": total_tokens,
        "status": (status or "success").strip().lower(),
        "latency_ms": latency_ms,
        "metadata": metadata or {},
        "sampled_at": datetime.now(timezone.utc).isoformat(),
    }

    with _lock:
        _recent_ai_calls.append((now, record))
        _ai_lifetime["calls"] += 1
        _ai_lifetime["input_tokens"] += safe_input
        _ai_lifetime["output_tokens"] += safe_output
        _ai_lifetime["total_tokens"] += total_tokens
        _ai_lifetime[f"operation:{record['operation']}"] += 1
        _ai_lifetime[f"model:{record['model_id']}"] += 1
        _ai_lifetime[f"status:{record['status']}"] += 1
        _trim_ai_locked(now)

    return ref


def get_metrics_snapshot() -> dict[str, Any]:
    """Return all tracked application metrics."""
    now = monotonic()
    with _lock:
        _trim_locked(now)
        recent = [event for _, event in _recent_events]
        per_minute = Counter(recent)
        lifetime = dict(_lifetime_events)
        _trim_ai_locked(now)
        ai_recent = [record for _, record in _recent_ai_calls]
        ai_per_minute = Counter(record["operation"] for record in ai_recent)
        ai_usage_recent = {
            "calls_last_minute": len(ai_recent),
            "input_tokens_last_minute": sum(record["input_tokens"] for record in ai_recent),
            "output_tokens_last_minute": sum(record["output_tokens"] for record in ai_recent),
            "total_tokens_last_minute": sum(record["total_tokens"] for record in ai_recent),
            "by_operation_last_minute": dict(ai_per_minute),
            "recent_calls": ai_recent[-25:],
        }
        ai_usage_lifetime = dict(_ai_lifetime)

    return {
        "window_seconds": int(_WINDOW_SECONDS),
        "events_last_minute": dict(per_minute),
        "total_events_last_minute": sum(per_minute.values()),
        "events_lifetime": lifetime,
        "total_events_lifetime": sum(lifetime.values()),
        "ai_usage": {
            "last_minute": ai_usage_recent,
            "lifetime": ai_usage_lifetime,
        },
        "sampled_at": datetime.now(timezone.utc).isoformat(),
    }


def _trim_locked(now: float) -> None:
    cutoff = now - _WINDOW_SECONDS
    while _recent_events and _recent_events[0][0] < cutoff:
        _recent_events.popleft()


def _trim_ai_locked(now: float) -> None:
    cutoff = now - _WINDOW_SECONDS
    while _recent_ai_calls and _recent_ai_calls[0][0] < cutoff:
        _recent_ai_calls.popleft()
