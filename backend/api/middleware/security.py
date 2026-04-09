"""
Security Middleware
-------------------
Implements critical security controls:
1. Rate Limiting (Redis-backed window)
2. Security Headers (HSTS, CSP, etc.)
3. Request ID (Traceability)
"""

import os
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.redis import InstrumentedRedis

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = InstrumentedRedis.from_url(redis_url, encoding="utf-8", decode_responses=True)
logger = logging.getLogger("security")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # HSTS (1 year)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        
        # No Sniff
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Frame Options
        response.headers["X-Frame-Options"] = "DENY"
        
        # CSP (Basic default, tighten as needed)
        # response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'"
        # Commented out CSP for now to avoid breaking existing dev flow, UNCOMMENT FOR PROD.
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple sliding window rate limiter using Redis.
    Limit: 100 requests / minute per IP.
    """
    RATE_LIMIT = 100
    WINDOW = 60
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static/health inputs if needed
        if request.url.path in {"/health", "/health/simple"} or request.method == "OPTIONS":
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"rate_limit:{client_ip}"
        
        try:
            # Set TTL only when key is first seen to avoid an extra EXPIRE on every request.
            count = await redis_client.incr(key)
            if count == 1:
                await redis_client.expire(key, self.WINDOW)
            
            if count > self.RATE_LIMIT:
                return Response(
                    "Rate limit exceeded", 
                    status_code=429,
                    headers={"Retry-After": str(self.WINDOW)}
                )
                
        except Exception as e:
            # Fail Open for Redis connection issues
            logger.warning(f"Rate Limit Redis Error: {e}")
            pass
            
        # Call the actual route OUTSIDE the try-except so exceptions bubble up!
        response = await call_next(request)
        
        # Add Rate Limit Headers if we have the count
        if 'count' in locals():
            response.headers["X-RateLimit-Limit"] = str(self.RATE_LIMIT)
            response.headers["X-RateLimit-Remaining"] = str(max(0, self.RATE_LIMIT - count))
            
        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
