from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.listing import Listing
    from app.models.user import User


class ReservationStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"

    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="listings.id", index=True)
    customer_id: int = Field(foreign_key="users.id", index=True)
    status: ReservationStatus = Field(
        default=ReservationStatus.PENDING,
        sa_column=Column(String(20), nullable=False),
    )
    reserved_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    listing: Optional["Listing"] = Relationship(back_populates="reservations")
    customer: Optional["User"] = Relationship(back_populates="reservations")
