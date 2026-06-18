from typing import Optional
from sqlmodel import Field, SQLModel

from app.models.user import UserRole


class UserRegister(SQLModel):
    name: str = Field(max_length=255)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.USER
    profile_picture_url: Optional[str] = None


class UserLogin(SQLModel):
    email: str
    password: str


class UserRead(SQLModel):
    id: int
    name: str
    email: str
    role: UserRole
    profile_picture_url: Optional[str] = None


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profile_picture_url: Optional[str] = None
