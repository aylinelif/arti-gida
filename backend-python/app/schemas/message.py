from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class MessageSendPayload(SQLModel):
    receiverId: int
    content: str
    listingId: Optional[int] = None


class MessageReadDto(SQLModel):
    id: int
    senderId: int
    receiverId: int
    content: str
    timestamp: datetime
    listingId: Optional[int] = None
    listingTitle: Optional[str] = None
    isRead: bool


class UserMinDto(SQLModel):
    id: int
    name: str
    role: str
    profilePictureUrl: Optional[str] = None


class ConversationReadDto(SQLModel):
    otherUser: UserMinDto
    lastMessage: MessageReadDto
    unreadCount: int
