from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.storage.database import get_db
from models.user import User
from api.dependencies import get_current_user
from models.thread import Thread
from core.credits.credit_service import CreditService, InsufficientCreditsError
from core.rag.retriever import get_similar_context
from core.intelligence.llama_engine import llama_chat
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/context/{thread_id}")
async def get_thread_context(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches RAG context related to the current thread."""
    stmt = select(Thread).where(Thread.id == thread_id, Thread.user_id == current_user.id)
    thread = (await db.execute(stmt)).scalars().first()

    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    if not thread.summary:
        return {"context": []}

    query_text = f"{thread.subject} {thread.intent} {thread.summary}"
    similar_items = await get_similar_context(
        query_text=query_text,
        user_id=current_user.id,
        limit=5,
        exclude_source_id=thread.id
    )
    return {"context": similar_items}


@router.post("/chat")
async def ai_chat(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Universal AI Chatbot using Llama 3.3 70B (HF Inference API).
    Returns SSE stream: 'data: <text>\\n\\n' chunks, ending with 'data: [DONE]\\n\\n'.
    """
    query = payload.get("message")
    if not query:
        raise HTTPException(status_code=400, detail="Missing chat message")

    operation_type = "ai_chat"
    if not await CreditService.check_balance(db, current_user.id, operation_type):
        raise HTTPException(status_code=402, detail="Insufficient credits.")

    charged_credits = await CreditService.get_operation_cost(db, operation_type)
    reservation_id = await CreditService.reserve_credits(
        db,
        current_user.id,
        operation_type,
        metadata={"source": "ai_chat"},
    )

    # 1. Fetch RAG context for this user
    similar_items = await get_similar_context(
        query_text=query,
        user_id=current_user.id,
        limit=6
    )

    context_str = "\n\n".join([
        f"--- {item.get('source_type', 'email')} ---\n{item.get('document', '')[:1000]}"
        for item in similar_items
    ])

    system_prompt = f"""You are the SortMail AI assistant. Help the user manage their email inbox intelligently and professionally.
You have access to the following context from their mailbox:

<context>
{context_str if context_str else "No relevant context found."}
</context>

Be concise, helpful, and professional. If context is provided, reference it specifically."""

    chat_messages = [{"role": "user", "content": query}]

    async def stream():
        try:
            response_text = await llama_chat(
                messages=chat_messages,
                system_prompt=system_prompt,
                max_tokens=1024,
                metadata={
                    "user_id": current_user.id,
                    "related_entity_type": "chat",
                    "related_entity_id": None,
                    "credits_charged": charged_credits,
                },
            )
            await CreditService.commit_reservation(db, reservation_id)
            await db.commit()
            # Emit in word-sized chunks to simulate streaming UX
            words = response_text.split(" ")
            chunk_size = 5
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i+chunk_size])
                if i + chunk_size < len(words):
                    chunk += " "
                safe = chunk.replace("\n", "\\n")
                yield f"data: {safe}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            await CreditService.rollback_reservation(db, reservation_id)
            await db.commit()
            logger.error(f"Chat stream failed: {e}")
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")
