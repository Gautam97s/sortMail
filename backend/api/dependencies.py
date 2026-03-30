"""
API Dependencies
----------------
Common dependencies like authentication and database sessions.
"""

from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from core.storage.database import get_db
from core.auth import jwt
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False) 

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    [MOCK AUTH BYPASS FOR DEVELOPMENT]
    Returns a mock user for local dashboard testing.
    """
    from models.user import UserStatus, AccountType, EmailProvider
    
    db_user = await db.scalar(select(User).where(User.id == "mock_user_123"))
    if not db_user:
        mock_user = User(
            id="mock_user_123",
            email="alex@example.com",
            name="Alex Rivera",
            provider=EmailProvider.GMAIL,
            status=UserStatus.ACTIVE,
            account_type=AccountType.INDIVIDUAL,
            is_superuser=False,
        )
        db.add(mock_user)
        try:
            await db.commit()
            await db.refresh(mock_user)
            return mock_user
        except Exception:
            await db.rollback()
            # If it failed to insert, might have been inserted concurrently
            db_user = await db.scalar(select(User).where(User.id == "mock_user_123"))
            if db_user:
                return db_user
            raise # Re-raise if we couldn't insert and it still doesn't exist
    return db_user
