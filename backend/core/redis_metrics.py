"""
In-process Redis Metrics
------------------------
Tracks Redis command activity for quick observability.
"""

from __future__ import annotations

from collections import Counter, deque
from datetime import datetime, timezone
from threading import Lock
from time import monotonic
from typing import Any

_WINDOW_SECONDS = 60.0
_timestamps: deque[tuple[float, str]] = deque()
_totals: Counter[str] = Counter()
_lock = Lock()


def record_redis_call(command: str) -> None:
    """Record a Redis command execution for rolling per-minute metrics."""
    cmd = (command or "UNKNOWN").upper()
    now = monotonic()

    with _lock:
        _timestamps.append((now, cmd))
        _totals[cmd] += 1
        _trim_locked(now)


def get_redis_metrics_snapshot() -> dict[str, Any]:
    """Return rolling 60-second and lifetime Redis usage stats."""
    now = monotonic()
    with _lock:
        _trim_locked(now)
        recent_commands = [cmd for _, cmd in _timestamps]
        calls_last_minute = len(recent_commands)
        command_breakdown_last_minute = Counter(recent_commands)
        lifetime_breakdown = dict(_totals)

    return {
        "window_seconds": int(_WINDOW_SECONDS),
        "calls_last_minute": calls_last_minute,
        "commands_last_minute": dict(command_breakdown_last_minute),
        "total_calls_lifetime": sum(lifetime_breakdown.values()),
        "commands_lifetime": lifetime_breakdown,
        "sampled_at": datetime.now(timezone.utc).isoformat(),
    }


def _trim_locked(now: float) -> None:
    cutoff = now - _WINDOW_SECONDS
    while _timestamps and _timestamps[0][0] < cutoff:
        _timestamps.popleft()
