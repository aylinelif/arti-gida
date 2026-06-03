from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.listing import Listing
from app.models.user import User, UserRole
from app.schemas.listing import ListingCreate, ListingRead, ListingUpdate


def _format_pickup_time(pickup_time: datetime) -> str:
    return pickup_time.strftime("%H:%M")


def _to_listing_read(listing: Listing, business_name: str) -> ListingRead:
    return ListingRead(
        id=listing.id,
        businessId=listing.business_id,
        establishmentName=business_name,
        title=listing.title,
        description=listing.description or "",
        quantity=listing.quantity,
        pickupTime=_format_pickup_time(listing.pickup_time),
        aiCategory=listing.category,
        aiShelfLife=listing.ai_shelf_life or "",
        allergens=listing.allergens or "Yok",
        carbonSaved=listing.carbon_saved or 0.0,
        latitude=listing.latitude,
        longitude=listing.longitude,
        imageUrl=listing.image_url or "",
        isActive=listing.is_active,
    )


class ListingService:
    def __init__(self, session: Session):
        self.session = session

    def _get_business_or_404(self, business_id: int) -> User:
        business = self.session.get(User, business_id)
        if business is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz business_id: {business_id}",
            )
        if business.role != UserRole.BUSINESS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="İlan yalnızca işletme hesabı ile oluşturulabilir.",
            )
        return business

    def _query_with_business(self):
        return (
            select(Listing, User.name)
            .join(User, Listing.business_id == User.id)
            .order_by(Listing.created_at.desc())
        )

    def create(self, payload: ListingCreate, business_id: int) -> ListingRead:
        business = self._get_business_or_404(business_id)

        lat = payload.latitude
        lng = payload.longitude
        if lat is None or lng is None:
            b_name = business.name.lower()
            if "fırın" in b_name:
                lat, lng = 41.4504, 31.7972
            elif "lokanta" in b_name:
                lat, lng = 41.4513, 31.7981
            elif "coffee" in b_name or "kahve" in b_name:
                lat, lng = 41.4520, 31.7995
            elif "market" in b_name:
                lat, lng = 41.4495, 31.7950
            elif "tatlı" in b_name:
                lat, lng = 41.4530, 31.8010
            else:
                import random
                lat = 41.4500 + (random.random() - 0.5) * 0.008
                lng = 31.7970 + (random.random() - 0.5) * 0.008

        listing = Listing(
            title=payload.title,
            description=payload.description,
            category=payload.category,
            quantity=payload.quantity,
            pickup_time=payload.pickup_time,
            image_url=payload.image_url,
            ai_shelf_life=payload.ai_shelf_life,
            allergens=payload.allergens,
            carbon_saved=payload.carbon_saved or 1.5,
            latitude=lat,
            longitude=lng,
            business_id=business_id,
        )
        self.session.add(listing)
        self.session.commit()
        self.session.refresh(listing)

        return _to_listing_read(listing, business.name)

    def list_all(self) -> list[ListingRead]:
        rows = self.session.exec(self._query_with_business()).all()
        return [_to_listing_read(listing, business_name) for listing, business_name in rows]

    def list_active(self) -> list[ListingRead]:
        statement = (
            self._query_with_business()
            .where(Listing.is_active == True)  # noqa: E712
            .where(Listing.quantity > 0)
        )
        rows = self.session.exec(statement).all()
        return [_to_listing_read(listing, business_name) for listing, business_name in rows]

    def get_by_id(self, listing_id: int) -> ListingRead:
        statement = (
            select(Listing, User.name)
            .join(User, Listing.business_id == User.id)
            .where(Listing.id == listing_id)
        )
        row = self.session.exec(statement).first()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"İlan bulunamadı: {listing_id}",
            )
        listing, business_name = row
        return _to_listing_read(listing, business_name)

    def update(self, listing_id: int, payload: ListingUpdate, business: User) -> ListingRead:
        listing = self.session.get(Listing, listing_id)
        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"İlan bulunamadı: {listing_id}",
            )
        if listing.business_id != business.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu ilanı güncelleme yetkiniz yok.",
            )

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(listing, key, value)

        if listing.quantity <= 0:
            listing.is_active = False

        self.session.add(listing)
        self.session.commit()
        self.session.refresh(listing)

        return _to_listing_read(listing, business.name)
