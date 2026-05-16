from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.deps import require_customer
from app.database import get_db
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationRead
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/reservations", tags=["reservations"])


def get_reservation_service(session: Session = Depends(get_db)) -> ReservationService:
    return ReservationService(session)


@router.post("/", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    payload: ReservationCreate,
    current_user: User = Depends(require_customer),
    service: ReservationService = Depends(get_reservation_service),
) -> ReservationRead:
    return service.create(current_user, payload)


@router.get("/my-reservations", response_model=list[ReservationRead])
def my_reservations(
    current_user: User = Depends(require_customer),
    service: ReservationService = Depends(get_reservation_service),
) -> list[ReservationRead]:
    return service.list_for_customer(current_user)
