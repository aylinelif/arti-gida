using System;
using System.Text.Json.Serialization;

namespace ArtiGida.API.Dtos
{
    public class ListingCreate
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; }

        [JsonPropertyName("pickup_time")]
        public DateTime PickupTime { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("ai_shelf_life")]
        public string? AiShelfLife { get; set; }

        public string? Allergens { get; set; }
        public double? CarbonSaved { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [JsonPropertyName("business_id")]
        public int? BusinessId { get; set; }
    }

    public class ListingUpdate
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public int? Quantity { get; set; }

        [JsonPropertyName("pickup_time")]
        public DateTime? PickupTime { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("ai_shelf_life")]
        public string? AiShelfLife { get; set; }

        public string? Allergens { get; set; }
        public double? CarbonSaved { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [JsonPropertyName("is_active")]
        public bool? IsActive { get; set; }
    }

    public class ListingRead
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public string EstablishmentName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string PickupTime { get; set; } = string.Empty;
        public string AiCategory { get; set; } = string.Empty;
        public string AiShelfLife { get; set; } = string.Empty;
        public string Allergens { get; set; } = string.Empty;
        public double CarbonSaved { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class ListingPredictPayload
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
