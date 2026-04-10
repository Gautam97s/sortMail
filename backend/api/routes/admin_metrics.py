"""
Admin Metrics Routes
--------------------
Admin-only observability endpoints.
"""

from time import monotonic
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import case, func, select
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
        func.coalesce(func.sum(AIUsageLog.cost_cents), 0),
        func.coalesce(func.sum(case((AIUsageLog.error_occurred.is_(True), 1), else_=0)), 0),
    ).where(*filters)
    totals_row = (await db.execute(totals_stmt)).one()

    lower_model = func.lower(AIUsageLog.model_name)
    bedrock_model_expr = (
        lower_model.like("%amazon%")
        | lower_model.like("%nova%")
        | lower_model.like("%bedrock%")
    )

    bedrock_totals_stmt = select(
        func.count(AIUsageLog.id),
        func.coalesce(func.sum(AIUsageLog.tokens_input), 0),
        func.coalesce(func.sum(AIUsageLog.tokens_output), 0),
        func.coalesce(func.sum(AIUsageLog.tokens_total), 0),
        func.coalesce(func.sum(AIUsageLog.cost_cents), 0),
        func.coalesce(func.sum(case((AIUsageLog.error_occurred.is_(True), 1), else_=0)), 0),
    ).where(*filters, bedrock_model_expr)
    bedrock_totals_row = (await db.execute(bedrock_totals_stmt)).one()

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

    by_model_stmt = (
        select(
            AIUsageLog.model_name,
            func.count(AIUsageLog.id).label("calls"),
            func.coalesce(func.sum(AIUsageLog.tokens_input), 0).label("tokens_input"),
            func.coalesce(func.sum(AIUsageLog.tokens_output), 0).label("tokens_output"),
            func.coalesce(func.sum(AIUsageLog.tokens_total), 0).label("tokens_total"),
            func.coalesce(func.avg(AIUsageLog.latency_ms), 0).label("avg_latency_ms"),
            func.coalesce(func.sum(case((AIUsageLog.error_occurred.is_(True), 1), else_=0)), 0).label("errors"),
        )
        .where(*filters)
        .group_by(AIUsageLog.model_name)
        .order_by(func.coalesce(func.sum(AIUsageLog.tokens_total), 0).desc())
        .limit(20)
    )
    by_model_rows = (await db.execute(by_model_stmt)).all()

    by_operation_stmt = (
        select(
            AIUsageLog.operation_type,
            func.count(AIUsageLog.id).label("calls"),
            func.coalesce(func.sum(AIUsageLog.tokens_total), 0).label("tokens_total"),
            func.coalesce(func.sum(AIUsageLog.cost_cents), 0).label("cost_cents"),
        )
        .where(*filters)
        .group_by(AIUsageLog.operation_type)
        .order_by(func.coalesce(func.sum(AIUsageLog.tokens_total), 0).desc())
        .limit(20)
    )
    by_operation_rows = (await db.execute(by_operation_stmt)).all()

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
            "provider": row.provider.value if row.provider else None,
            "tokens_input": row.tokens_input,
            "tokens_output": row.tokens_output,
            "tokens_total": row.tokens_total,
            "cost_cents": row.cost_cents,
            "credits_charged": row.credits_charged,
            "latency_ms": row.latency_ms,
            "related_entity_type": row.related_entity_type,
            "related_entity_id": row.related_entity_id,
            "request_id": row.request_id,
            "error_occurred": row.error_occurred,
            "error_type": row.error_type,
            "cache_hit": row.cache_hit,
        }
        for row in rows
    ]

    total_calls = int(totals_row[0] or 0)
    total_tokens = int(totals_row[3] or 0)
    total_errors = int(totals_row[5] or 0)

    bedrock_calls = int(bedrock_totals_row[0] or 0)
    bedrock_tokens = int(bedrock_totals_row[3] or 0)
    bedrock_errors = int(bedrock_totals_row[5] or 0)

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
            "calls": total_calls,
            "tokens_input": int(totals_row[1] or 0),
            "tokens_output": int(totals_row[2] or 0),
            "tokens_total": total_tokens,
            "cost_cents": int(totals_row[4] or 0),
            "errors": total_errors,
            "avg_tokens_per_call": round((total_tokens / total_calls), 2) if total_calls else 0,
            "error_rate_pct": round((total_errors / total_calls) * 100, 3) if total_calls else 0,
        },
        "bedrock": {
            "calls": bedrock_calls,
            "tokens_input": int(bedrock_totals_row[1] or 0),
            "tokens_output": int(bedrock_totals_row[2] or 0),
            "tokens_total": bedrock_tokens,
            "cost_cents": int(bedrock_totals_row[4] or 0),
            "errors": bedrock_errors,
            "avg_tokens_per_call": round((bedrock_tokens / bedrock_calls), 2) if bedrock_calls else 0,
            "error_rate_pct": round((bedrock_errors / bedrock_calls) * 100, 3) if bedrock_calls else 0,
        },
        "by_user": [
            {
                "user_id": row[0],
                "calls": int(row[1] or 0),
                "tokens_total": int(row[2] or 0),
            }
            for row in by_user_rows
        ],
        "by_model": [
            {
                "model_name": row[0],
                "calls": int(row[1] or 0),
                "tokens_input": int(row[2] or 0),
                "tokens_output": int(row[3] or 0),
                "tokens_total": int(row[4] or 0),
                "avg_latency_ms": round(float(row[5] or 0), 2),
                "errors": int(row[6] or 0),
            }
            for row in by_model_rows
        ],
        "by_operation": [
            {
                "operation_type": row[0],
                "calls": int(row[1] or 0),
                "tokens_total": int(row[2] or 0),
                "cost_cents": int(row[3] or 0),
            }
            for row in by_operation_rows
        ],
        "records": records,
    }
