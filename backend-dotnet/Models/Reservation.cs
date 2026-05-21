using System;
using System.Text.Json.Serialization;

namespace ArtiGida.API.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReservationStatus
    {
        pending,
        completed,
        cancelled
    }

    public class Reservation
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public int CustomerId { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.pending;
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public FoodListing? Listing { get; set; }
        public User? Customer { get; set; }
    }
}
