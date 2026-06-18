using System;

namespace ArtiGida.API.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int? ListingId { get; set; }
        public bool IsRead { get; set; } = false;

        // Navigation properties
        public User? Sender { get; set; }
        public User? Receiver { get; set; }
        public FoodListing? Listing { get; set; }
    }
}
