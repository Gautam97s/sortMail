"""
Admin Metrics Routes
--------------------
Admin-only observability endpoints.
"""

from time import monotonic
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.ai import AIUsageLog

from api.dependencies import get_current_user
from core.app_metrics import get_metrics_snapshot
from core.redis_metrics import get_redis_metrics_snapshot
from app.config import settings
from core.intelligence.processing_queue import get_queue
from core.storage.database import get_db

router = APIRouter()

_QUEUE_SIZE_CACHE_TTL_SECONDS = 20.0
_queue_size_cache_value: int | None = None
_queue_size_cache_ts: float = 0.0


async def _get_queue_size_cached() -> tuple[bool, int | None]:
    global _queue_size_cache_value, _queue_size_cache_ts

    queue_enabled = bool(getattr(settings, "REDIS_URL", None))
    if not queue_enabled:
        return False, None

    now = monotonic()
    if (now - _queue_size_cache_ts) < _QUEUE_SIZE_CACHE_TTL_SECONDS:
        return True, _queue_size_cache_value

    queue_size: int | None = None
    try:
        queue = get_queue(settings.REDIS_URL)
        queue_size = await queue.size()
    except Exception:
        queue_size = None

    _queue_size_cache_value = queue_size
    _queue_size_cache_ts = now
    return True, queue_size


async def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/overview")
async def metrics_overview(admin: User = Depends(require_superuser)):
    _ = admin

    queue_enabled, queue_size = await _get_queue_size_cached()

    return {
        "app": get_metrics_snapshot(),
        "redis": get_redis_metrics_snapshot(),
        "queue": {
            "enabled": queue_enabled,
            "pending_items": queue_size,
        },
    }


@router.get("/app")
async def app_metrics(admin: User = Depends(require_superuser)):
    _ = admin
    return get_metrics_snapshot()


@router.get("/redis")
async def redis_metrics(admin: User = Depends(require_superuser)):
    _ = admin
    return get_redis_metrics_snapshot()


@router.get("/queue")
async def queue_metrics(admin: User = Depends(require_superuser)):
    _ = admin

    queue_enabled, pending_items = await _get_queue_size_cached()
    if not queue_enabled:
        return {
            "enabled": False,
            "pending_items": None,
        }

    return {
        "enabled": True,
        "pending_items": pending_items,
    }


@router.get("/ai-usage")
async def ai_usage_metrics(
    hours: int = 24,
    limit: int = 200,
    user_id: str | None = None,
    related_entity_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_superuser),
):
    _ = admin

    safe_hours = min(max(int(hours or 24), 1), 24 * 30)
    safe_limit = min(max(int(limit or 200), 1), 1000)
    since_ts = datetime.now(timezone.utc) - timedelta(hours=safe_hours)

    filters = [AIUsageLog.created_at >= since_ts]
    if user_id:
        filters.append(AIUsageLog.user_id == user_id)
    if related_entity_id:
        filters.append(AIUsageLog.related_entity_id == related_entity_id)

    totals_stmt = select(
        func.count(AIUsageLog.id),
        func.coalesce(func.sum(AIUsageLog.tokens_input), 0),
        func.coalesce(func.sum(AIUsageLog.tokens_output), 0),
        func.coalesce(func.sum(AIUsageLog.tokens_total), 0),
    ).where(*filters)
    totals_row = (await db.execute(totals_stmt)).one()

    by_user_stmt = (
        select(
            AIUsageLog.user_id,
            func.count(AIUsageLog.id).label("calls"),
            func.coalesce(func.sum(AIUsageLog.tokens_total), 0).label("tokens_total"),
        )
        .where(*filters)
        .group_by(AIUsageLog.user_id)
        .order_by(func.coalesce(func.sum(AIUsageLog.tokens_total), 0).desc())
        .limit(50)
    )
    by_user_rows = (await db.execute(by_user_stmt)).all()

    rows_stmt = (
        select(AIUsageLog)
        .where(*filters)
        .order_by(AIUsageLog.created_at.desc())
        .limit(safe_limit)
    )
    rows = (await db.execute(rows_stmt)).scalars().all()

    records = [
        {
            "id": row.id,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "user_id": row.user_id,
            "operation_type": row.operation_type,
            "model_name": row.model_name,
            "tokens_input": row.tokens_input,
            "tokens_output": row.tokens_output,
            "tokens_total": row.tokens_total,
            "latency_ms": row.latency_ms,
            "related_entity_type": row.related_entity_type,
            "related_entity_id": row.related_entity_id,
            "request_id": row.request_id,
            "error_occurred": row.error_occurred,
            "error_type": row.error_type,
        }
        for row in rows
    ]

    return {
        "window": {
            "hours": safe_hours,
            "since": since_ts.isoformat(),
        },
        "filters": {
            "user_id": user_id,
            "related_entity_id": related_entity_id,
            "limit": safe_limit,
        },
        "totals": {
            "calls": int(totals_row[0] or 0),
            "tokens_input": int(totals_row[1] or 0),
            "tokens_output": int(totals_row[2] or 0),
            "tokens_total": int(totals_row[3] or 0),
        },
        "by_user": [
            {
                "user_id": row[0],
                "calls": int(row[1] or 0),
                "tokens_total": int(row[2] or 0),
            }
            for row in by_user_rows
        ],
        "records": records,
    }
