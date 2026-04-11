"""
Attachment Context Strategy
---------------------------
Stores attachment text into Chroma with tenant-safe metadata.
"""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from core.rag.embeddings import _estimate_tokens, chunk_text_for_rag, generate_embedding
from core.storage.s3 import s3_client
from core.storage.vector_store import vector_store
from models.attachment import Attachment, AttachmentStatus

logger = logging.getLogger(__name__)


class AttachmentContextStrategy:
    """Intelligent routing for attachment context by token volume."""

    @staticmethod
    async def process_attachment(attachment_orm: Attachment, user_id: str, db: AsyncSession):
        text = attachment_orm.extracted_text or ""
        attachment_id = attachment_orm.id

        if len(text.strip()) < 100:
            logger.info("Attachment %s has negligible text; indexing skipped.", attachment_id)
            attachment_orm.status = AttachmentStatus.SKIPPED
            attachment_orm.skip_reason = "negligible_text"
            await db.commit()
            return

        token_count = _estimate_tokens(text)

        if token_count < 5000:
            await AttachmentContextStrategy.store_in_postgres_and_chroma(attachment_orm, text, user_id, db)
        elif token_count < 50000:
            await AttachmentContextStrategy.store_hybrid(attachment_orm, text, user_id, db)
        else:
            await AttachmentContextStrategy.store_in_s3_with_summary(attachment_orm, text, user_id, db)

    @staticmethod
    async def store_in_postgres_and_chroma(attachment_orm: Attachment, text: str, user_id: str, db: AsyncSession):
        attachment_id = attachment_orm.id
        filename = attachment_orm.filename
        chunks = chunk_text_for_rag(text, max_chunk_tokens=512)

        for i, chunk in enumerate(chunks):
            embedding = await generate_embedding(
                chunk["text"],
                user_id=user_id,
                operation_type="attachment_embedding",
                related_entity_type="attachment",
                related_entity_id=attachment_id,
                metadata={"source_type": "attachment", "source_id": attachment_id, "chunk_index": i},
            )
            await vector_store.add(
                id=f"{attachment_id}_chunk_{i}",
                document=chunk["text"][:16000],
                embedding=embedding,
                metadata={
                    "user_id": user_id,
                    "source_type": "attachment",
                    "source_id": attachment_id,
                    "filename": filename,
                    "email_id": attachment_orm.email_id,
                    "chunk_index": i,
                    "token_count": chunk["tokens"],
                },
            )

        attachment_orm.extracted_text = text
        attachment_orm.chunk_count = len(chunks)
        attachment_orm.status = AttachmentStatus.INDEXED
        attachment_orm.skip_reason = None
        await db.commit()

    @staticmethod
    async def store_hybrid(attachment_orm: Attachment, text: str, user_id: str, db: AsyncSession):
        attachment_id = attachment_orm.id
        filename = attachment_orm.filename
        s3_path = f"users/{user_id}/attachments/text/{attachment_id}.txt.gz"

        await s3_client.upload_compressed(text, s3_path)

        key_excerpts = text[:10000]
        chunks = chunk_text_for_rag(key_excerpts, max_chunk_tokens=512)

        for i, chunk in enumerate(chunks):
            embedding = await generate_embedding(
                chunk["text"],
                user_id=user_id,
                operation_type="attachment_embedding",
                related_entity_type="attachment",
                related_entity_id=attachment_id,
                metadata={"source_type": "attachment", "source_id": attachment_id, "chunk_index": i},
            )
            await vector_store.add(
                id=f"{attachment_id}_chunk_{i}",
                document=chunk["text"][:16000],
                embedding=embedding,
                metadata={
                    "user_id": user_id,
                    "source_type": "attachment",
                    "source_id": attachment_id,
                    "filename": filename,
                    "email_id": attachment_orm.email_id,
                    "s3_path": s3_path,
                    "chunk_index": i,
                },
            )

        attachment_orm.storage_path = s3_path
        attachment_orm.extracted_text = key_excerpts[:5000]
        attachment_orm.chunk_count = len(chunks)
        attachment_orm.status = AttachmentStatus.INDEXED
        attachment_orm.skip_reason = None
        await db.commit()

    @staticmethod
    async def store_in_s3_with_summary(attachment_orm: Attachment, text: str, user_id: str, db: AsyncSession):
        attachment_id = attachment_orm.id
        filename = attachment_orm.filename
        s3_path = f"users/{user_id}/attachments/text/{attachment_id}.txt.gz"

        await s3_client.upload_compressed(text, s3_path)

        summary_text = (
            f"Attachment summary placeholder for '{filename}'. "
            f"Large document ({len(text)} chars) stored in object storage."
        )

        embedding = await generate_embedding(
            summary_text,
            user_id=user_id,
            operation_type="attachment_summary_embedding",
            related_entity_type="attachment",
            related_entity_id=attachment_id,
            metadata={"source_type": "attachment_summary", "source_id": attachment_id},
        )
        await vector_store.add(
            id=f"{attachment_id}_summary",
            document=summary_text,
            embedding=embedding,
            metadata={
                "user_id": user_id,
                "source_type": "attachment_summary",
                "source_id": attachment_id,
                "filename": filename,
                "email_id": attachment_orm.email_id,
                "s3_path": s3_path,
            },
        )

        attachment_orm.storage_path = s3_path
        attachment_orm.extracted_text = summary_text
        attachment_orm.chunk_count = 1
        attachment_orm.status = AttachmentStatus.INDEXED
        attachment_orm.skip_reason = None
        await db.commit()
