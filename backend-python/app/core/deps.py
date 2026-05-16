from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", 0))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş oturum.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_business(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca işletme hesapları içindir.",
        )
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem yalnızca müşteri hesapları içindir.",
        )
    return user
