from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.storage.database import get_db
from models.user import User
from api.dependencies import get_current_user
from models.thread import Thread
from core.rag.retriever import get_similar_context
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_genai_client():
    """Get google.genai client (new SDK)."""
    from google import genai
    return genai.Client(api_key=settings.GEMINI_API_KEY)


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
        
    # Query ChromaDB using the thread's summary and intent
    query_text = f"{thread.subject} {thread.intent} {thread.summary}"
    
    # Find similar files/threads
    similar_items = await get_similar_context(
        query_text=query_text,
        user_id=current_user.id,
        limit=5,
        exclude_source_id=thread.id
    )
    
    return {"context": similar_items}

@router.post("/chat")
async def ai_chat_stream(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Universal RAG Chatbot Endpoint.
    Streams back a Server-Sent Events (SSE) response using Gemini 2.5 Flash.
    """
    query = payload.get("message")
    if not query:
        raise HTTPException(status_code=400, detail="Missing chat message")
        
    # 1. Fetch RAG Context
    similar_items = await get_similar_context(
        query_text=query,
        user_id=current_user.id,
        limit=6
    )
    
    # 2. Build Prompt Context
    context_str = "\n\n".join([
        f"--- Source: {item.get('source_type', 'unknown')} ---\n{item.get('document', '')[:1000]}"
        for item in similar_items
    ])
    
    prompt = f"""You are the SortMail AI assistant. Help the user concisely and professionally.
You have access to the following related context from their mailbox:

<context>
{context_str}
</context>

User Query: {query}
"""

    async def generate_chat_stream():
        try:
            import asyncio
            client = _get_genai_client()
            
            def _stream():
                chunks = []
                for chunk in client.models.generate_content_stream(
                    model="gemini-2.5-flash",
                    contents=prompt,
                ):
                    if chunk.text:
                        chunks.append(chunk.text)
                return chunks

            chunks = await asyncio.to_thread(_stream)
            for text in chunks:
                safe_text = text.replace("\n", "\\n")
                yield f"data: {safe_text}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Chat stream failed: {e}")
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(generate_chat_stream(), media_type="text/event-stream")

