"""
Rate Limiter
------------
Redis-backed rate limiter for managing API quotas.
Implements a Token Bucket algorithm to smooth out bursts.
"""

import time
import asyncio
import logging
from typing import Optional

from core.redis import get_redis

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Redis-backed Token Bucket Rate Limiter.
    
    Usage:
        limiter = RateLimiter(rate=10, capacity=20) # 10 req/s, burst of 20
        await limiter.acquire("user_123", cost=1)
    """
    
    def __init__(self, rate: float = 10.0, capacity: float = 20.0, namespace: str = "rate_limit"):
        self.rate = rate  # tokens per second
        self.capacity = capacity # max tokens
        self.namespace = namespace

    async def acquire(self, key: str, cost: int = 1, timeout: int = 30):
        """
        Acquire tokens. Blocks if insufficient tokens available.
        
        Args:
            key: Unique identifier (e.g. user_id)
            cost: Number of tokens to consume
            timeout: Max time to wait in seconds
        """
        redis = await get_redis()
        token_key = f"{self.namespace}:{key}:tokens"
        timestamp_key = f"{self.namespace}:{key}:ts"
        
        start_wait = time.time()
        
        while True:
            now = time.time()
            
            # Lua script to perform atomic get-refill-check-decrement
            # 1. Get current tokens & last timestamp
            # 2. Refill based on time delta
            # 3. If enough tokens, decrement and return 1 (success)
            # 4. If not, return 0 (fail) and ttl (time to wait)
            # ARGV: [rate, capacity, now, cost]
            script = """
            local rate = tonumber(ARGV[1])
            local capacity = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            local cost = tonumber(ARGV[4])
            
            local last_tokens = tonumber(redis.call("get", KEYS[1]))
            local last_ts = tonumber(redis.call("get", KEYS[2]))
            
            if last_tokens == nil then
                last_tokens = capacity
            end
            if last_ts == nil then
                last_ts = now
            end
            
            local delta = math.max(0, now - last_ts)
            local filled = math.min(capacity, last_tokens + (delta * rate))
            
            if filled >= cost then
                redis.call("set", KEYS[1], filled - cost)
                redis.call("set", KEYS[2], now)
                -- Set expiry to handle cleanup (e.g. 1 hour)
                redis.call("expire", KEYS[1], 3600)
                redis.call("expire", KEYS[2], 3600)
                return -1
            else
                local missing = cost - filled
                local wait_time = missing / rate
                return wait_time
            end
            """
            
            result = await redis.eval(script, 2, token_key, timestamp_key, self.rate, self.capacity, now, cost)
            
            if result == -1:
                # Success
                return
            
            # Wait required
            wait_time = float(result)
            
            if time.time() - start_wait + wait_time > timeout:
                raise TimeoutError(f"Rate limit acquire timed out after {timeout}s")
                
            logger.debug(f"Rate limited for {key}, waiting {wait_time:.2f}s")
            await asyncio.sleep(wait_time)
