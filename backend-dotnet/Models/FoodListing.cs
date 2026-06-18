using System;
using System.Collections.Generic;

namespace ArtiGida.API.Models
{
    public class FoodListing
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime PickupTime { get; set; }
        public string? ImageUrl { get; set; }
        public string? AiShelfLife { get; set; }
        public string? Allergens { get; set; }
        public double CarbonSaved { get; set; } = 0.0;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; } = true;
        public int BusinessId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? Business { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
