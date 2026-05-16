from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.reservation import Reservation
    from app.models.user import User


class Listing(SQLModel, table=True):
    __tablename__ = "listings"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    category: str = Field(max_length=100)
    quantity: int = Field(ge=0)
    pickup_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    image_url: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    ai_shelf_life: Optional[str] = Field(
        default=None,
        max_length=50,
        sa_column=Column(String(50), nullable=True),
    )
    is_active: bool = Field(default=True, sa_column=Column(Boolean, nullable=False))
    business_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    business: Optional["User"] = Relationship(back_populates="listings")
    reservations: list["Reservation"] = Relationship(back_populates="listing")
