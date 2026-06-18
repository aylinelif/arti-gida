using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ArtiGida.API.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserRole
    {
        user,
        business
    }

    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.user;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ProfilePictureUrl { get; set; }

        // Navigation properties
        public ICollection<FoodListing> Listings { get; set; } = new List<FoodListing>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
