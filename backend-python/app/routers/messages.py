from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.message import MessageSendPayload, MessageReadDto, ConversationReadDto
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


def get_message_service(session: Session = Depends(get_db)) -> MessageService:
    return MessageService(session)


@router.get("/conversations", response_model=list[ConversationReadDto])
def get_conversations(
    current_user: User = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> list[ConversationReadDto]:
    return service.get_conversations(current_user)


@router.get("/history/{other_user_id}", response_model=list[MessageReadDto])
def get_history(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> list[MessageReadDto]:
    return service.get_history(current_user, other_user_id)


@router.post("/", response_model=MessageReadDto, status_code=status.HTTP_200_OK)
def send_message(
    payload: MessageSendPayload,
    current_user: User = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> MessageReadDto:
    return service.send_message(current_user, payload)
