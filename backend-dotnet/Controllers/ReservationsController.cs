using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ArtiGida.API.Data;
using ArtiGida.API.Dtos;
using ArtiGida.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArtiGida.API.Controllers
{
    [ApiController]
    [Route("reservations")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
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

        private static ReservationRead MapToReadDto(Reservation reservation)
        {
            var localPickupTime = reservation.Listing != null 
                ? TimeZoneInfo.ConvertTime(reservation.Listing.PickupTime, LocalTimeZone).ToString("H:mm")
                : "";

            return new ReservationRead
            {
                Id = reservation.Id,
                ListingId = reservation.ListingId,
                ListingTitle = reservation.Listing?.Title ?? "Bilinmeyen Ürün",
                EstablishmentName = reservation.Listing?.Business?.Name ?? "Bilinmeyen İşletme",
                PickupTime = localPickupTime,
                Status = reservation.Status,
                ReservedAt = reservation.ReservedAt
            };
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ReservationRead))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromBody] ReservationCreate payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            if (roleClaim != "user")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Rezervasyon yalnızca müşteri hesabı ile yapılabilir." });
            }

            var listing = await _context.Listings
                .Include(l => l.Business)
                .FirstOrDefaultAsync(l => l.Id == payload.ListingId);

            if (listing == null || !listing.IsActive)
            {
                return NotFound(new { detail = "İlan bulunamadı veya aktif değil." });
            }

            if (listing.Quantity <= 0)
            {
                return BadRequest(new { detail = "Bu ilan için stok kalmamış." });
            }

            var existing = await _context.Reservations.AnyAsync(r => 
                r.ListingId == listing.Id && 
                r.CustomerId == currentUserId && 
                r.Status == ReservationStatus.pending
            );

            if (existing)
            {
                return BadRequest(new { detail = "Bu ilan için zaten aktif bir rezervasyonunuz var." });
            }

            var reservation = new Reservation
            {
                ListingId = listing.Id,
                CustomerId = currentUserId,
                Status = ReservationStatus.pending,
                ReservedAt = DateTime.UtcNow
            };

            listing.Quantity -= 1;
            if (listing.Quantity == 0)
            {
                listing.IsActive = false;
            }

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // Set listing on the reservation object for Mapping
            reservation.Listing = listing;

            return Ok(MapToReadDto(reservation));
        }

        [HttpGet("my-reservations")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ReservationRead>))]
        public async Task<IActionResult> GetMyReservations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            var reservations = await _context.Reservations
                .Include(r => r.Listing)
                    .ThenInclude(l => l!.Business)
                .Where(r => r.CustomerId == currentUserId)
                .OrderByDescending(r => r.ReservedAt)
                .ToListAsync();

            var result = reservations.Select(MapToReadDto);
            return Ok(result);
        }
    }
}
