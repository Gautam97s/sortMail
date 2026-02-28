"""
Magic Link Core logic
---------------------
Handles token generation, storage, and verification.
"""
import secrets
import json
import logging
from typing import Optional
from core.redis import get_redis

logger = logging.getLogger(__name__)

# Token configuration
TOKEN_EXPIRY = 900  # 15 minutes in seconds

async def generate_magic_link_token(email: str) -> str:
    """
    Generates a secure random token and stores it in Redis with the user's email.
    """
    token = secrets.token_urlsafe(32)
    redis = await get_redis()
    
    # Store token -> email mapping
    key = f"magic_link:{token}"
    await redis.setex(key, TOKEN_EXPIRY, email)
    
    logger.info(f"🆕 Generated magic link token for {email}")
    return token

async def verify_magic_link_token(token: str) -> Optional[str]:
    """
    Verifies a magic link token and returns the associated email if valid.
    The token is deleted after use to prevent replay attacks.
    """
    redis = await get_redis()
    key = f"magic_link:{token}"
    
    email_bytes = await redis.get(key)
    if not email_bytes:
        logger.warning(f"⚠️ Magic link token invalid or expired: {token[:8]}...")
        return None
    
    # Delete token after verification (single use)
    await redis.delete(key)
    
    email = email_bytes.decode("utf-8") if isinstance(email_bytes, bytes) else email_bytes
    logger.info(f"✅ Magic link token verified for {email}")
    return email
