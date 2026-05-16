from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.listing import Listing
    from app.models.reservation import Reservation


class UserRole(str, Enum):
    USER = "user"
    BUSINESS = "business"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    email: str = Field(max_length=255, unique=True, index=True)
    password_hash: str = Field(max_length=255)
    role: UserRole = Field(
        default=UserRole.USER,
        sa_column=Column(String(20), nullable=False),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    listings: list["Listing"] = Relationship(back_populates="business")
    reservations: list["Reservation"] = Relationship(back_populates="customer")
