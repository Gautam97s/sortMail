"""
API Auth Middleware
-------------------
JWT validation for protected routes.
"""

from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.auth.jwt import verify_token, TokenData


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    """
    [MOCK AUTH BYPASS FOR DEVELOPMENT]
    """
    from datetime import datetime
    return TokenData(
        user_id="mock_user_123",
        email="alex@example.com",
        exp=datetime.now()
    )


async def get_optional_user(
    request: Request,
) -> Optional[TokenData]:
    """
    Optional user - returns None if not authenticated.
    
    Useful for routes that work with or without auth.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    return verify_token(token)
