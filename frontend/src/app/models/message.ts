export interface UserMin {
  id: number;
  name: string;
  role: string;
  profilePictureUrl?: string;
}

export interface MessageRead {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  listingId?: number;
  listingTitle?: string;
  isRead: boolean;
}

export interface ConversationRead {
  otherUser: UserMin;
  lastMessage: MessageRead;
  unreadCount: number;
}
