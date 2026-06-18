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

        [HttpGet("business")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<BusinessReservationRead>))]
        public async Task<IActionResult> GetBusinessReservations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            if (roleClaim != "business")
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Bu işlem yalnızca işletme hesabı ile yapılabilir." });
            }

            var reservations = await _context.Reservations
                .Include(r => r.Customer)
                .Include(r => r.Listing)
                .Where(r => r.Listing!.BusinessId == currentUserId)
                .OrderByDescending(r => r.ReservedAt)
                .ToListAsync();

            var result = reservations.Select(r => new BusinessReservationRead
            {
                Id = r.Id,
                ListingId = r.ListingId,
                ListingTitle = r.Listing?.Title ?? "Bilinmeyen Ürün",
                CustomerName = r.Customer?.Name ?? "Bilinmeyen Müşteri",
                CustomerEmail = r.Customer?.Email ?? "Bilinmeyen E-posta",
                ReservedAt = r.ReservedAt,
                Status = r.Status,
                PickupTime = r.Listing != null ? TimeZoneInfo.ConvertTime(r.Listing.PickupTime, LocalTimeZone).ToString("H:mm") : ""
            });

            return Ok(result);
        }

        [HttpPut("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] ReservationStatusUpdate payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { detail = "Giriş yapmalısınız." });
            }

            var reservation = await _context.Reservations
                .Include(r => r.Listing)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return NotFound(new { detail = "Rezervasyon bulunamadı." });
            }

            // A customer can cancel their own reservation
            // A business can change status (complete/cancel) of reservations for their listings
            if (roleClaim == "business")
            {
                if (reservation.Listing!.BusinessId != currentUserId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Bu rezervasyonu güncelleme yetkiniz yok." });
                }
            }
            else if (roleClaim == "user")
            {
                if (reservation.CustomerId != currentUserId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { detail = "Bu rezervasyonu güncelleme yetkiniz yok." });
                }
                if (payload.Status != ReservationStatus.cancelled)
                {
                    return BadRequest(new { detail = "Müşteriler yalnızca rezervasyonu iptal edebilir." });
                }
            }
            else
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            var oldStatus = reservation.Status;
            reservation.Status = payload.Status;

            // If reservation is cancelled, restore listing quantity!
            if (payload.Status == ReservationStatus.cancelled && oldStatus != ReservationStatus.cancelled)
            {
                reservation.Listing!.Quantity += 1;
                reservation.Listing.IsActive = true;
            }
            // If it was cancelled and is now set back, reduce quantity
            else if (oldStatus == ReservationStatus.cancelled && payload.Status != ReservationStatus.cancelled)
            {
                if (reservation.Listing!.Quantity <= 0)
                {
                    return BadRequest(new { detail = "İlanın stoğu kalmadığı için durum güncellenemiyor." });
                }
                reservation.Listing.Quantity -= 1;
                if (reservation.Listing.Quantity == 0)
                {
                    reservation.Listing.IsActive = false;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { detail = "Rezervasyon durumu güncellendi.", status = reservation.Status });
        }
    }
}
