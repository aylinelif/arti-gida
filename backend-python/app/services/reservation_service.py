from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.listing import Listing
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationRead


def _format_pickup_time(pickup_time: datetime) -> str:
    return pickup_time.strftime("%H:%M")


def _to_reservation_read(
    reservation: Reservation,
    listing: Listing,
    business_name: str,
) -> ReservationRead:
    return ReservationRead(
        id=reservation.id,
        listingId=listing.id,
        listingTitle=listing.title,
        establishmentName=business_name,
        pickupTime=_format_pickup_time(listing.pickup_time),
        status=reservation.status,
        reservedAt=reservation.reserved_at,
    )


class ReservationService:
    def __init__(self, session: Session):
        self.session = session

    def create(self, customer: User, payload: ReservationCreate) -> ReservationRead:
        listing = self.session.get(Listing, payload.listing_id)
        if listing is None or not listing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="İlan bulunamadı veya aktif değil.",
            )
        if listing.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu ilan için stok kalmamış.",
            )

        existing = self.session.exec(
            select(Reservation).where(
                Reservation.listing_id == listing.id,
                Reservation.customer_id == customer.id,
                Reservation.status == ReservationStatus.PENDING,
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu ilan için zaten aktif bir rezervasyonunuz var.",
            )

        business = self.session.get(User, listing.business_id)
        if business is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="İşletme bilgisi bulunamadı.",
            )

        reservation = Reservation(
            listing_id=listing.id,
            customer_id=customer.id,
        )
        listing.quantity -= 1
        if listing.quantity == 0:
            listing.is_active = False

        self.session.add(reservation)
        self.session.add(listing)
        self.session.commit()
        self.session.refresh(reservation)

        return _to_reservation_read(reservation, listing, business.name)

    def list_for_customer(self, customer: User) -> list[ReservationRead]:
        statement = (
            select(Reservation, Listing, User.name)
            .join(Listing, Reservation.listing_id == Listing.id)
            .join(User, Listing.business_id == User.id)
            .where(Reservation.customer_id == customer.id)
            .order_by(Reservation.reserved_at.desc())
        )
        rows = self.session.exec(statement).all()
        return [
            _to_reservation_read(reservation, listing, business_name)
            for reservation, listing, business_name in rows
        ]
