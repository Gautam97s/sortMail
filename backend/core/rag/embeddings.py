"""
Shared Embeddings Module
------------------------
Provides LLM-agnostic embedding generation for RAG pipelines.
"""

import logging
import asyncio
import json
from typing import List, Dict
import boto3
from botocore.config import Config

from core.app_metrics import record_ai_usage, record_metric

logger = logging.getLogger(__name__)

def _estimate_tokens(text: str) -> int:
    """Estimate token count for routing constraints."""
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except ImportError:
        # Fallback estimation 1 token ~= 1.3 words (standard cl100k estimate)
        return int(len(text.split()) * 1.3)

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding using configured provider with a fixed output dimensionality."""
    from app.config import settings

    target_dims = max(int(getattr(settings, "BEDROCK_EMBED_DIMENSIONS", 1024) or 1024), 1)
    provider = (getattr(settings, "EMBEDDING_PROVIDER", "bedrock") or "bedrock").strip().lower()

    if provider == "bedrock":
        model_id = settings.BEDROCK_EMBED_MODEL_ID
        region = settings.BEDROCK_REGION_NAME or settings.AWS_REGION_NAME or "us-east-1"

        def _embed_bedrock():
            client = boto3.client(
                "bedrock-runtime",
                region_name=region,
                config=Config(read_timeout=3600, retries={"max_attempts": 3, "mode": "adaptive"}),
            )
            payload = {
                "inputText": text,
                "dimensions": target_dims,
                "normalize": bool(getattr(settings, "BEDROCK_EMBED_NORMALIZE", True)),
            }
            response = client.invoke_model(modelId=model_id, body=json.dumps(payload))
            body = response.get("body")
            data = json.loads(body.read()) if body else {}
            embedding = data.get("embedding") or data.get("embeddings") or []
            token_count = int(data.get("inputTextTokenCount") or 0)
            return embedding, token_count

        try:
            record_metric("embedding_call_attempt")
            embedding, input_tokens = await asyncio.to_thread(_embed_bedrock)
            fitted = _fit_dimensions(embedding, target_dims)
            record_metric("embedding_call_success")
            record_ai_usage(
                operation="embedding",
                model_id=model_id,
                input_tokens=input_tokens or _estimate_tokens(text),
                output_tokens=0,
                metadata={"dimension": len(fitted), "provider": "bedrock"},
            )
            return fitted
        except Exception as e:
            logger.error(f"Failed embedding generation via Bedrock Titan: {e}")
            record_metric("embedding_call_error")
            record_ai_usage(
                operation="embedding",
                model_id=model_id,
                input_tokens=0,
                output_tokens=0,
                status="error",
                metadata={"provider": "bedrock", "error": str(e)[:300]},
            )
            return [0.0] * target_dims

    if provider == "gemini" and settings.GEMINI_API_KEY:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Using Google's text-embedding model in a threadpool
        def _embed():
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text
            )
            return response.embeddings[0].values
        try:
            record_metric("embedding_call_attempt")
            result = await asyncio.to_thread(_embed)
            fitted = _fit_dimensions(result, target_dims)
            record_metric("embedding_call_success")
            record_ai_usage(
                operation="embedding",
                model_id="gemini-embedding-001",
                input_tokens=_estimate_tokens(text),
                output_tokens=0,
                metadata={"dimension": len(fitted), "provider": "gemini"},
            )
            return fitted
        except Exception as e:
            logger.error(f"Failed embedding generation via Gemini SDK: {e}")
            record_metric("embedding_call_error")
            record_ai_usage(
                operation="embedding",
                model_id="gemini-embedding-001",
                input_tokens=0,
                output_tokens=0,
                status="error",
                metadata={"provider": "gemini", "error": str(e)[:300]},
            )
            return [0.0] * target_dims
            
    if provider == "openai" and settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            record_metric("embedding_call_attempt")
            response = await client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            fitted = _fit_dimensions(response.data[0].embedding, target_dims)
            record_metric("embedding_call_success")
            record_ai_usage(
                operation="embedding",
                model_id="text-embedding-3-small",
                input_tokens=_estimate_tokens(text),
                output_tokens=0,
                metadata={"dimension": len(fitted), "provider": "openai"},
            )
            return fitted
        except Exception as e:
            logger.error(f"Failed embedding generation via OpenAI: {e}")
            record_metric("embedding_call_error")
            record_ai_usage(
                operation="embedding",
                model_id="text-embedding-3-small",
                input_tokens=0,
                output_tokens=0,
                status="error",
                metadata={"provider": "openai", "error": str(e)[:300]},
            )
            return [0.0] * target_dims
            
    # Dev mock fallback if APIs unconfigured
    return [0.0] * target_dims


def _fit_dimensions(values: List[float], target_dims: int) -> List[float]:
    """Pad or trim vectors to keep collection dimensions consistent."""
    if not values:
        return [0.0] * target_dims
    if len(values) == target_dims:
        return [float(v) for v in values]
    if len(values) > target_dims:
        return [float(v) for v in values[:target_dims]]
    padded = [float(v) for v in values]
    padded.extend([0.0] * (target_dims - len(values)))
    return padded

def chunk_text_for_rag(text: str, max_chunk_tokens: int = 512) -> List[Dict]:
    """Smart chunking that preserves meaning based on paragraph boundaries."""
    paragraphs = text.split('\\n\\n')
    chunks = []
    current_chunk = ""
    current_tokens = 0
    
    for para in paragraphs:
        para_tokens = _estimate_tokens(para)
        
        if para_tokens > max_chunk_tokens:
            sentences = para.split('. ')
            for sentence in sentences:
                sent_tokens = _estimate_tokens(sentence)
                if current_tokens + sent_tokens > max_chunk_tokens:
                    if current_chunk:
                        chunks.append({
                            'text': current_chunk.strip(),
                            'tokens': current_tokens
                        })
                    current_chunk = sentence + '. '
                    current_tokens = sent_tokens
                else:
                    current_chunk += sentence + '. '
                    current_tokens += sent_tokens
        else:
            if current_tokens + para_tokens > max_chunk_tokens:
                if current_chunk:
                    chunks.append({
                        'text': current_chunk.strip(),
                        'tokens': current_tokens
                    })
                current_chunk = para + '\\n\\n'
                current_tokens = para_tokens
            else:
                current_chunk += para + '\\n\\n'
                current_tokens += para_tokens
                
    if current_chunk:
        chunks.append({
            'text': current_chunk.strip(),
            'tokens': current_tokens
        })
        
    return chunks
