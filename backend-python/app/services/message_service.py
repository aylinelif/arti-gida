from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.message import ChatMessage
from app.models.user import User
from app.models.listing import Listing
from app.schemas.message import MessageSendPayload, MessageReadDto, ConversationReadDto, UserMinDto

class MessageService:
    def __init__(self, session: Session):
        self.session = session

    def get_conversations(self, current_user: User) -> list[ConversationReadDto]:
        # Fetch all messages involving the current user
        statement = select(ChatMessage).where(
            (ChatMessage.sender_id == current_user.id) | 
            (ChatMessage.receiver_id == current_user.id)
        )
        messages = self.session.exec(statement).all()

        # Group by the other user ID
        conversations_dict = {}
        for m in messages:
            other_user_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
            if other_user_id not in conversations_dict:
                conversations_dict[other_user_id] = []
            conversations_dict[other_user_id].append(m)

        result = []
        for other_user_id, user_msgs in conversations_dict.items():
            user_msgs.sort(key=lambda x: x.timestamp, reverse=True)
            last_message = user_msgs[0]
            
            # Fetch other user info
            other_user = self.session.get(User, other_user_id)
            if not other_user:
                continue
            
            # Fetch listing title if present
            listing_title = None
            if last_message.listing_id:
                listing = self.session.get(Listing, last_message.listing_id)
                if listing:
                    listing_title = listing.title

            unread_count = sum(1 for m in user_msgs if m.receiver_id == current_user.id and not m.is_read)

            result.append(ConversationReadDto(
                otherUser=UserMinDto(
                    id=other_user.id,
                    name=other_user.name,
                    role=other_user.role.value,
                    profilePictureUrl=other_user.profile_picture_url
                ),
                lastMessage=MessageReadDto(
                    id=last_message.id,
                    senderId=last_message.sender_id,
                    receiverId=last_message.receiver_id,
                    content=last_message.content,
                    timestamp=last_message.timestamp,
                    listingId=last_message.listing_id,
                    listingTitle=listing_title,
                    isRead=last_message.is_read
                ),
                unreadCount=unread_count
            ))

        result.sort(key=lambda x: x.lastMessage.timestamp, reverse=True)
        return result

    def get_history(self, current_user: User, other_user_id: int) -> list[MessageReadDto]:
        statement = select(ChatMessage).where(
            ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == other_user_id)) |
            ((ChatMessage.sender_id == other_user_id) & (ChatMessage.receiver_id == current_user.id))
        ).order_by(ChatMessage.timestamp)
        messages = self.session.exec(statement).all()

        # Mark unread messages sent by other user as read
        updated = False
        for m in messages:
            if m.receiver_id == current_user.id and not m.is_read:
                m.is_read = True
                self.session.add(m)
                updated = True
        
        if updated:
            self.session.commit()

        result = []
        for m in messages:
            listing_title = None
            if m.listing_id:
                listing = self.session.get(Listing, m.listing_id)
                if listing:
                    listing_title = listing.title

            result.append(MessageReadDto(
                id=m.id,
                senderId=m.sender_id,
                receiverId=m.receiver_id,
                content=m.content,
                timestamp=m.timestamp,
                listingId=m.listing_id,
                listingTitle=listing_title,
                isRead=m.is_read
            ))
        return result

    def send_message(self, current_user: User, payload: MessageSendPayload) -> MessageReadDto:
        if payload.receiverId == current_user.id:
            raise HTTPException(status_code=400, detail="Kendinize mesaj gönderemezsiniz.")
        if not payload.content.strip():
            raise HTTPException(status_code=400, detail="Mesaj içeriği boş olamaz.")

        receiver = self.session.get(User, payload.receiverId)
        if not receiver:
            raise HTTPException(status_code=404, detail="Alıcı bulunamadı.")

        db_message = ChatMessage(
            sender_id=current_user.id,
            receiver_id=payload.receiverId,
            content=payload.content.strip(),
            timestamp=datetime.now(timezone.utc),
            listing_id=payload.listingId,
            is_read=False
        )
        self.session.add(db_message)
        self.session.commit()
        self.session.refresh(db_message)

        listing_title = None
        if db_message.listing_id:
            listing = self.session.get(Listing, db_message.listing_id)
            if listing:
                listing_title = listing.title

        return MessageReadDto(
            id=db_message.id,
            senderId=db_message.sender_id,
            receiverId=db_message.receiver_id,
            content=db_message.content,
            timestamp=db_message.timestamp,
            listingId=db_message.listing_id,
            listingTitle=listing_title,
            isRead=db_message.is_read
        )
