"""
API Routes - Attachments
------------------------
Endpoints for previewing and downloading email attachments.
"""

import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.storage.database import get_db
from models.attachment import Attachment
from models.user import User
from api.dependencies import get_current_user

router = APIRouter()

@router.get("/{attachment_id}/preview")
async def preview_attachment(
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Preview an attachment in the browser (inline).
    Suitable for images, PDFs, etc.
    """
    stmt = select(Attachment).where(
        Attachment.id == attachment_id,
        Attachment.user_id == current_user.id
    )
    result = await db.execute(stmt)
    attachment = result.scalars().first()

    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    if not attachment.storage_path or not os.path.exists(attachment.storage_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file not found on server")

    return FileResponse(
        path=attachment.storage_path,
        media_type=attachment.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{attachment.filename}"'}
    )


@router.get("/{attachment_id}/download")
async def download_attachment(
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Download an attachment (forces save dialog).
    """
    stmt = select(Attachment).where(
        Attachment.id == attachment_id,
        Attachment.user_id == current_user.id
    )
    result = await db.execute(stmt)
    attachment = result.scalars().first()

    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    if not attachment.storage_path or not os.path.exists(attachment.storage_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file not found on server")

    return FileResponse(
        path=attachment.storage_path,
        media_type=attachment.mime_type or "application/octet-stream",
        filename=attachment.filename
    )
