from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserRead, UserRegister


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def register(self, payload: UserRegister) -> TokenResponse:
        existing = self.session.exec(
            select(User).where(User.email == payload.email)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresi zaten kayıtlı.",
            )

        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=payload.role,
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return self._build_token_response(user)

    def login(self, payload: UserLogin) -> TokenResponse:
        user = self.session.exec(
            select(User).where(User.email == payload.email)
        ).first()
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-posta veya şifre hatalı.",
            )
        return self._build_token_response(user)

    def _build_token_response(self, user: User) -> TokenResponse:
        role = user.role.value if hasattr(user.role, "value") else str(user.role)
        token = create_access_token(str(user.id), role)
        return TokenResponse(
            access_token=token,
            user=UserRead(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
            ),
        )
