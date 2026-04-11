"""
Shared Embeddings Module
------------------------
Provides LLM-agnostic embedding generation for RAG pipelines.
"""

import logging
import asyncio
import json
from typing import List, Dict, Optional, Any
import boto3
from botocore.config import Config

from core.app_metrics import record_ai_usage, record_metric
from core.credits.credit_service import CreditService, InsufficientCreditsError
from core.credits.token_pricing import calculate_embedding_billing, milli_to_credits
from core.storage.database import async_session_factory
from models.ai import AIProvider, AIUsageLog

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


def _token_source(provider: str, exact: bool) -> str:
    return f"{provider}:{'exact' if exact else 'estimated'}"

async def generate_embedding(
    text: str,
    *,
    user_id: Optional[str] = None,
    operation_type: str = "embedding",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> List[float]:
    """Generate embedding using configured provider with a fixed output dimensionality."""
    return await generate_embedding_with_billing(
        text,
        user_id=user_id,
        operation_type=operation_type,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        metadata=metadata,
    )


async def generate_embedding_with_billing(
    text: str,
    *,
    user_id: Optional[str] = None,
    operation_type: str = "embedding",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> List[float]:
    """Generate an embedding and charge/persist it when a user context is available."""
    from app.config import settings

    target_dims = max(int(getattr(settings, "BEDROCK_EMBED_DIMENSIONS", 1024) or 1024), 1)
    provider = (getattr(settings, "EMBEDDING_PROVIDER", "bedrock") or "bedrock").strip().lower()

    billing_input_tokens = _estimate_tokens(text)
    if user_id:
        estimated_billing = calculate_embedding_billing(billing_input_tokens)
        estimated_milli_credits = max(int(estimated_billing.milli_credits_exact), 1)
        async with async_session_factory() as precheck_db:
            has_budget = await CreditService.has_credit_amount(precheck_db, user_id, estimated_milli_credits)
        if not has_budget:
            raise InsufficientCreditsError(
                f"Insufficient credits for embedding request budget. required_milli~{estimated_milli_credits}"
            )

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
            token_count_raw = data.get("inputTextTokenCount")
            token_count = int(token_count_raw or 0)
            token_source = _token_source("bedrock", token_count_raw is not None)
            return embedding, token_count, token_source

        try:
            record_metric("embedding_call_attempt")
            embedding, input_tokens, token_source = await asyncio.to_thread(_embed_bedrock)
            fitted = _fit_dimensions(embedding, target_dims)
            record_metric("embedding_call_success")
            actual_input_tokens = int(input_tokens or billing_input_tokens)
            usage_metadata = {"dimension": len(fitted), "provider": "bedrock", "token_source": token_source}
            if user_id:
                await _charge_and_persist_embedding_usage(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id=model_id,
                    provider="bedrock",
                    input_tokens=actual_input_tokens,
                    token_source=token_source,
                    metadata={**(metadata or {}), **usage_metadata},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id=model_id,
                input_tokens=actual_input_tokens,
                output_tokens=0,
                token_source=token_source,
                metadata={**usage_metadata, **(metadata or {})},
            )
            return fitted
        except InsufficientCreditsError:
            raise
        except Exception as e:
            logger.error(f"Failed embedding generation via Bedrock Titan: {e}")
            record_metric("embedding_call_error")
            if user_id:
                await _persist_embedding_usage_row(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id=model_id,
                    provider="bedrock",
                    input_tokens=0,
                    token_source="error",
                    status="error",
                    error_type=str(e)[:300],
                    metadata={**(metadata or {}), "provider": "bedrock", "error": str(e)[:300], "token_source": "error"},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id=model_id,
                input_tokens=0,
                output_tokens=0,
                token_source="error",
                status="error",
                metadata={"provider": "bedrock", "error": str(e)[:300], "token_source": "error"},
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
            token_source = _token_source("gemini", False)
            if user_id:
                await _charge_and_persist_embedding_usage(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id="gemini-embedding-001",
                    provider="gemini",
                    input_tokens=billing_input_tokens,
                    token_source=token_source,
                    metadata={**(metadata or {}), "dimension": len(fitted), "provider": "gemini", "token_source": token_source},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id="gemini-embedding-001",
                input_tokens=billing_input_tokens,
                output_tokens=0,
                token_source=token_source,
                metadata={"dimension": len(fitted), "provider": "gemini", "token_source": token_source, **(metadata or {})},
            )
            return fitted
        except InsufficientCreditsError:
            raise
        except Exception as e:
            logger.error(f"Failed embedding generation via Gemini SDK: {e}")
            record_metric("embedding_call_error")
            if user_id:
                await _persist_embedding_usage_row(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id="gemini-embedding-001",
                    provider="gemini",
                    input_tokens=0,
                    token_source="error",
                    status="error",
                    error_type=str(e)[:300],
                    metadata={**(metadata or {}), "provider": "gemini", "error": str(e)[:300], "token_source": "error"},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id="gemini-embedding-001",
                input_tokens=0,
                output_tokens=0,
                token_source="error",
                status="error",
                metadata={"provider": "gemini", "error": str(e)[:300], "token_source": "error"},
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
            token_source = _token_source("openai", False)
            if user_id:
                await _charge_and_persist_embedding_usage(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id="text-embedding-3-small",
                    provider="openai",
                    input_tokens=billing_input_tokens,
                    token_source=token_source,
                    metadata={**(metadata or {}), "dimension": len(fitted), "provider": "openai", "token_source": token_source},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id="text-embedding-3-small",
                input_tokens=billing_input_tokens,
                output_tokens=0,
                token_source=token_source,
                metadata={"dimension": len(fitted), "provider": "openai", "token_source": token_source, **(metadata or {})},
            )
            return fitted
        except InsufficientCreditsError:
            raise
        except Exception as e:
            logger.error(f"Failed embedding generation via OpenAI: {e}")
            record_metric("embedding_call_error")
            if user_id:
                await _persist_embedding_usage_row(
                    user_id=user_id,
                    operation_type=operation_type,
                    model_id="text-embedding-3-small",
                    provider="openai",
                    input_tokens=0,
                    token_source="error",
                    status="error",
                    error_type=str(e)[:300],
                    metadata={**(metadata or {}), "provider": "openai", "error": str(e)[:300], "token_source": "error"},
                    related_entity_type=related_entity_type,
                    related_entity_id=related_entity_id,
                )
            record_ai_usage(
                operation=operation_type,
                model_id="text-embedding-3-small",
                input_tokens=0,
                output_tokens=0,
                token_source="error",
                status="error",
                metadata={"provider": "openai", "error": str(e)[:300], "token_source": "error"},
            )
            return [0.0] * target_dims
            
    # Dev mock fallback if APIs unconfigured
    if user_id:
        raise InsufficientCreditsError("Embedding provider is not configured for user-scoped billing path.")
    return [0.0] * target_dims


async def _charge_and_persist_embedding_usage(
    *,
    user_id: str,
    operation_type: str,
    model_id: str,
    provider: str,
    input_tokens: int,
    token_source: str,
    metadata: Optional[dict[str, Any]] = None,
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
) -> dict[str, Any]:
    breakdown = calculate_embedding_billing(input_tokens)

    async with async_session_factory() as charge_db:
        charge_result = await CreditService.charge_embedding_usage(
            charge_db,
            user_id=user_id,
            operation_type=operation_type,
            input_tokens=input_tokens,
            model_name=model_id,
            provider=provider,
            related_entity_id=related_entity_id,
            related_entity_type=related_entity_type,
            metadata={
                **(metadata or {}),
                "token_source": token_source,
                "pricing": {
                    "provider_cost_usd": round(float(breakdown.provider_cost_usd), 8),
                    "user_billable_usd": round(float(breakdown.user_billable_usd), 8),
                    "credits_exact": round(float(breakdown.credits_exact), 6),
                    "charged_milli_credits": int(max(breakdown.milli_credits_exact, 0)),
                    "charged_credits": round(milli_to_credits(breakdown.milli_credits_exact), 6),
                    "credit_unit_usd": 0.001,
                },
            },
        )
        await charge_db.commit()

    try:
        async with async_session_factory() as db:
            row = AIUsageLog(
                user_id=user_id,
                operation_type=operation_type.upper(),
                provider=AIProvider.CUSTOM,
                model_name=model_id,
                tokens_input=input_tokens,
                tokens_output=0,
                tokens_total=input_tokens,
                cost_cents=max(int(round(breakdown.provider_cost_usd * 100)), 0),
                credits_charged=max(int(charge_result.get("charged_milli_credits") or 0), 0),
                latency_ms=None,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                request_id=None,
                error_occurred=False,
                error_type=None,
                metadata_json={
                    **(metadata or {}),
                    "token_source": token_source,
                    "pricing": {
                        "provider_cost_usd": round(float(breakdown.provider_cost_usd), 8),
                        "user_billable_usd": round(float(breakdown.user_billable_usd), 8),
                        "credits_exact": round(float(breakdown.credits_exact), 6),
                        "charged_milli_credits": int(max(charge_result.get("charged_milli_credits") or 0, 0)),
                    },
                    "balance_after": charge_result.get("balance_after"),
                },
            )
            db.add(row)
            await db.commit()
    except Exception as exc:
        logger.warning("Failed to persist embedding usage row for op=%s user=%s: %s", operation_type, user_id, exc)

    return charge_result


async def _persist_embedding_usage_row(
    *,
    user_id: str,
    operation_type: str,
    model_id: str,
    provider: str,
    input_tokens: int,
    token_source: str,
    status: str,
    error_type: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
) -> None:
    try:
        async with async_session_factory() as db:
            row = AIUsageLog(
                user_id=user_id,
                operation_type=operation_type.upper(),
                provider=AIProvider.CUSTOM,
                model_name=model_id,
                tokens_input=max(int(input_tokens or 0), 0),
                tokens_output=0,
                tokens_total=max(int(input_tokens or 0), 0),
                cost_cents=0,
                credits_charged=0,
                latency_ms=None,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                request_id=None,
                error_occurred=status.lower() != "success",
                error_type=error_type,
                metadata_json={
                    **(metadata or {}),
                    "token_source": token_source,
                    "pricing": {
                        "provider_cost_usd": 0.0,
                        "user_billable_usd": 0.0,
                        "credits_exact": 0.0,
                        "charged_milli_credits": 0,
                        "charged_credits": 0.0,
                    },
                    "charge_error": error_type,
                },
            )
            db.add(row)
            await db.commit()
    except Exception as exc:
        logger.warning("Failed to persist embedding error row for op=%s user=%s: %s", operation_type, user_id, exc)


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
