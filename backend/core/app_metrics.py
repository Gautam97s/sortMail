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

_WINDOW_SECONDS = 60.0
_recent_events: deque[tuple[float, str]] = deque()
_lifetime_events: Counter[str] = Counter()
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


def get_metrics_snapshot() -> dict[str, Any]:
    """Return all tracked application metrics."""
    now = monotonic()
    with _lock:
        _trim_locked(now)
        recent = [event for _, event in _recent_events]
        per_minute = Counter(recent)
        lifetime = dict(_lifetime_events)

    return {
        "window_seconds": int(_WINDOW_SECONDS),
        "events_last_minute": dict(per_minute),
        "total_events_last_minute": sum(per_minute.values()),
        "events_lifetime": lifetime,
        "total_events_lifetime": sum(lifetime.values()),
        "sampled_at": datetime.now(timezone.utc).isoformat(),
    }


def _trim_locked(now: float) -> None:
    cutoff = now - _WINDOW_SECONDS
    while _recent_events and _recent_events[0][0] < cutoff:
        _recent_events.popleft()
