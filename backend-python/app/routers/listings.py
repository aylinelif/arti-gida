from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.deps import get_current_user, require_business
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.listing import ListingCreate, ListingRead, ListingUpdate
from app.services.listing_service import ListingService

router = APIRouter(prefix="/listings", tags=["listings"])


def get_listing_service(session: Session = Depends(get_db)) -> ListingService:
    return ListingService(session)


@router.post("/", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(require_business),
    service: ListingService = Depends(get_listing_service),
) -> ListingRead:
    business_id = payload.business_id or current_user.id
    if business_id != current_user.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Başka bir işletme adına ilan oluşturamazsınız.",
        )
    return service.create(payload, business_id)


@router.get("/", response_model=list[ListingRead])
def list_listings(
    service: ListingService = Depends(get_listing_service),
) -> list[ListingRead]:
    return service.list_all()


@router.get("/active", response_model=list[ListingRead])
def list_active_listings(
    service: ListingService = Depends(get_listing_service),
) -> list[ListingRead]:
    return service.list_active()


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(
    listing_id: int,
    service: ListingService = Depends(get_listing_service),
) -> ListingRead:
    return service.get_by_id(listing_id)


@router.put("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    current_user: User = Depends(require_business),
    service: ListingService = Depends(get_listing_service),
) -> ListingRead:
    return service.update(listing_id, payload, current_user)
