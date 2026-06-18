using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ArtiGida.API.Data;
using ArtiGida.API.Dtos;
using ArtiGida.API.Models;
using ArtiGida.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArtiGida.API.Controllers
{
    [ApiController]
    [Route("listings")]
    public class ListingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAIService _aiService;

        public ListingsController(AppDbContext context, IAIService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        private static readonly TimeZoneInfo LocalTimeZone = GetLocalTimeZone();

        private static TimeZoneInfo GetLocalTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            }
            catch
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                }
                catch
                {
                    return TimeZoneInfo.Utc;
                }
            }
        }

        private static ListingRead MapToReadDto(FoodListing listing)
        {
            var localTime = TimeZoneInfo.ConvertTime(listing.PickupTime, LocalTimeZone);
            return new ListingRead
            {
                Id = listing.Id,
                BusinessId = listing.BusinessId,
                EstablishmentName = listing.Business?.Name ?? "Bilinmeyen İşletme",
                Title = listing.Title,
                Description = listing.Description ?? "",
                Quantity = listing.Quantity,
                PickupTime = localTime.ToString("H:mm"), // formats as HH:mm in local time
                AiCategory = listing.Category,
                AiShelfLife = listing.AiShelfLife ?? "",
                Allergens = listing.Allergens ?? "Yok",
                CarbonSaved = listing.CarbonSaved,
                Latitude = listing.Latitude,
                Longitude = listing.Longitude,
                ImageUrl = listing.ImageUrl ?? "",
                IsActive = listing.IsActive
            };
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ListingRead))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Create([FromBody] ListingCreate payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            if (roleClaim != "business")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { detail = "İlan yalnızca işletme hesabı ile oluşturulabilir." });
            }

            var businessId = payload.BusinessId ?? currentUserId;
            if (businessId != currentUserId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Başka bir işletme adına ilan oluşturamazsınız." });
            }

            var business = await _context.Users.FindAsync(businessId);
            if (business == null || business.Role != UserRole.business)
            {
                return BadRequest(new { detail = "Geçersiz işletme." });
            }

            // Run AI predictions for category, shelf life, allergens, and carbon saved
            var (predictedCategory, predictedShelfLife, predictedAllergens, predictedCarbonSaved) = 
                await _aiService.PredictListingDetailsAsync(payload.Title, payload.Description ?? "");

            double? lat = payload.Latitude;
            double? lng = payload.Longitude;
            if (!lat.HasValue || !lng.HasValue)
            {
                var bName = business.Name.ToLowerInvariant();
                if (bName.Contains("fırın")) { lat = 41.4504; lng = 31.7972; }
                else if (bName.Contains("lokanta")) { lat = 41.4513; lng = 31.7981; }
                else if (bName.Contains("coffee") || bName.Contains("kahve")) { lat = 41.4520; lng = 31.7995; }
                else if (bName.Contains("market")) { lat = 41.4495; lng = 31.7950; }
                else if (bName.Contains("tatlı")) { lat = 41.4530; lng = 31.8010; }
                else
                {
                    var rand = new Random();
                    lat = 41.4500 + (rand.NextDouble() - 0.5) * 0.008;
                    lng = 31.7970 + (rand.NextDouble() - 0.5) * 0.008;
                }
            }

            var listing = new FoodListing
            {
                Title = payload.Title,
                Description = payload.Description,
                Category = string.IsNullOrWhiteSpace(payload.Category) ? predictedCategory : payload.Category,
                Quantity = payload.Quantity,
                PickupTime = payload.PickupTime.ToUniversalTime(),
                ImageUrl = payload.ImageUrl,
                AiShelfLife = string.IsNullOrWhiteSpace(payload.AiShelfLife) ? predictedShelfLife : payload.AiShelfLife,
                Allergens = string.IsNullOrWhiteSpace(payload.Allergens) ? predictedAllergens : payload.Allergens,
                CarbonSaved = payload.CarbonSaved ?? predictedCarbonSaved,
                Latitude = lat,
                Longitude = lng,
                IsActive = payload.Quantity > 0,
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(listing);
            await _context.SaveChangesAsync();

            // Fetch with business navigation property populated for mapping
            listing.Business = business;

            return CreatedAtAction(nameof(GetById), new { id = listing.Id }, MapToReadDto(listing));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ListingRead>))]
        public async Task<IActionResult> GetAll()
        {
            var listings = await _context.Listings
                .Include(l => l.Business)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            var result = listings.Select(MapToReadDto);
            return Ok(result);
        }

        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ListingRead>))]
        public async Task<IActionResult> GetActive()
        {
            var listings = await _context.Listings
                .Include(l => l.Business)
                .Where(l => l.IsActive && l.Quantity > 0)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            var result = listings.Select(MapToReadDto);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ListingRead))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var listing = await _context.Listings
                .Include(l => l.Business)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null)
            {
                return NotFound(new { detail = $"İlan bulunamadı: {id}" });
            }

            return Ok(MapToReadDto(listing));
        }

        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ListingRead))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] ListingUpdate payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            var listing = await _context.Listings
                .Include(l => l.Business)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (listing == null)
            {
                return NotFound(new { detail = $"İlan bulunamadı: {id}" });
            }

            if (listing.BusinessId != currentUserId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Bu ilanı güncelleme yetkiniz yok." });
            }

            if (payload.Title != null) listing.Title = payload.Title;
            if (payload.Description != null) listing.Description = payload.Description;
            if (payload.Category != null) listing.Category = payload.Category;
            if (payload.Quantity.HasValue)
            {
                listing.Quantity = payload.Quantity.Value;
                if (listing.Quantity <= 0)
                {
                    listing.IsActive = false;
                }
            }
            if (payload.PickupTime.HasValue) listing.PickupTime = payload.PickupTime.Value.ToUniversalTime();
            if (payload.ImageUrl != null) listing.ImageUrl = payload.ImageUrl;
            if (payload.AiShelfLife != null) listing.AiShelfLife = payload.AiShelfLife;
            if (payload.Allergens != null) listing.Allergens = payload.Allergens;
            if (payload.CarbonSaved.HasValue) listing.CarbonSaved = payload.CarbonSaved.Value;
            if (payload.Latitude.HasValue) listing.Latitude = payload.Latitude.Value;
            if (payload.Longitude.HasValue) listing.Longitude = payload.Longitude.Value;
            if (payload.IsActive.HasValue) listing.IsActive = payload.IsActive.Value;

            await _context.SaveChangesAsync();

            return Ok(MapToReadDto(listing));
        }

        [HttpPost("predict")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Predict([FromBody] ListingPredictPayload payload)
        {
            var (predictedCategory, predictedShelfLife, predictedAllergens, predictedCarbonSaved) = 
                await _aiService.PredictListingDetailsAsync(payload.Title, payload.Description ?? "");
            return Ok(new { 
                category = predictedCategory, 
                shelfLife = predictedShelfLife,
                allergens = predictedAllergens,
                carbonSaved = predictedCarbonSaved
            });
        }
    }
}
