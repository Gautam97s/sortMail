"""
Admin Metrics Routes
--------------------
Admin-only observability endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from models.user import User

from api.dependencies import get_current_user
from core.app_metrics import get_metrics_snapshot
from core.redis_metrics import get_redis_metrics_snapshot
from app.config import settings
from core.intelligence.processing_queue import get_queue

router = APIRouter()


async def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/overview")
async def metrics_overview(admin: User = Depends(require_superuser)):
    _ = admin

    queue_size = None
    queue_enabled = bool(getattr(settings, "REDIS_URL", None))
    if queue_enabled:
        try:
            queue = get_queue(settings.REDIS_URL)
            queue_size = await queue.size()
        except Exception:
            queue_size = None

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

    queue_enabled = bool(getattr(settings, "REDIS_URL", None))
    if not queue_enabled:
        return {
            "enabled": False,
            "pending_items": None,
        }

    pending_items = None
    try:
        queue = get_queue(settings.REDIS_URL)
        pending_items = await queue.size()
    except Exception:
        pending_items = None

    return {
        "enabled": True,
        "pending_items": pending_items,
    }
