from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.listing import Listing


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="users.id", index=True)
    receiver_id: int = Field(foreign_key="users.id", index=True)
    content: str = Field(sa_column=Column(Text, nullable=False))
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    listing_id: Optional[int] = Field(default=None, foreign_key="listings.id", nullable=True)
    is_read: bool = Field(default=False)

    sender: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[ChatMessage.sender_id]"}
    )
    receiver: Optional["User"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[ChatMessage.receiver_id]"}
    )
    listing: Optional["Listing"] = Relationship()
