using System;

namespace ArtiGida.API.Dtos
{
    public class MessageSendPayload
    {
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int? ListingId { get; set; }
    }

    public class MessageReadDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int? ListingId { get; set; }
        public string? ListingTitle { get; set; }
        public bool IsRead { get; set; }
    }

    public class ConversationReadDto
    {
        public UserMinDto OtherUser { get; set; } = null!;
        public MessageReadDto LastMessage { get; set; } = null!;
        public int UnreadCount { get; set; }
    }

    public class UserMinDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
    }
}
