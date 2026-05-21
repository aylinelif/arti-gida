using System;
using System.Text.Json.Serialization;
using ArtiGida.API.Models;

namespace ArtiGida.API.Dtos
{
    public class ReservationCreate
    {
        [JsonPropertyName("listing_id")]
        public int ListingId { get; set; }
    }

    public class ReservationRead
    {
        public int Id { get; set; }
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
        public string EstablishmentName { get; set; } = string.Empty;
        public string PickupTime { get; set; } = string.Empty;
        public ReservationStatus Status { get; set; }
        public DateTime ReservedAt { get; set; }
    }
}
