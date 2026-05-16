from datetime import datetime

from app.models.reservation import ReservationStatus
from sqlmodel import SQLModel


class ReservationCreate(SQLModel):
    listing_id: int


class ReservationRead(SQLModel):
    id: int
    listingId: int
    listingTitle: str
    establishmentName: str
    pickupTime: str
    status: ReservationStatus
    reservedAt: datetime
