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
    [Route("messages")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("conversations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetConversations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var currentUserId = int.Parse(userIdClaim);

            // Fetch all messages involving the current user
            var messages = await _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Listing)
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .ToListAsync();

            // Group by the other user ID
            var conversations = messages
                .GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Select(g => {
                    var otherUserId = g.Key;
                    var lastMessage = g.OrderByDescending(m => m.Timestamp).First();
                    
                    // The other user entity (can be sender or receiver in the last message)
                    var otherUser = lastMessage.SenderId == currentUserId ? lastMessage.Receiver! : lastMessage.Sender!;

                    var unreadCount = g.Count(m => m.ReceiverId == currentUserId && !m.IsRead);

                    return new ConversationReadDto
                    {
                        OtherUser = new UserMinDto
                        {
                            Id = otherUser.Id,
                            Name = otherUser.Name,
                            Role = otherUser.Role.ToString(),
                            ProfilePictureUrl = otherUser.ProfilePictureUrl
                        },
                        LastMessage = new MessageReadDto
                        {
                            Id = lastMessage.Id,
                            SenderId = lastMessage.SenderId,
                            ReceiverId = lastMessage.ReceiverId,
                            Content = lastMessage.Content,
                            Timestamp = lastMessage.Timestamp,
                            ListingId = lastMessage.ListingId,
                            ListingTitle = lastMessage.Listing?.Title,
                            IsRead = lastMessage.IsRead
                        },
                        UnreadCount = unreadCount
                    };
                })
                .OrderByDescending(c => c.LastMessage.Timestamp)
                .ToList();

            return Ok(conversations);
        }

        [HttpGet("history/{otherUserId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int otherUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var currentUserId = int.Parse(userIdClaim);

            var messages = await _context.ChatMessages
                .Include(m => m.Listing)
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == otherUserId) || 
                            (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

            // Mark unread messages sent by the other user as read
            var unreadMessages = messages.Where(m => m.ReceiverId == currentUserId && !m.IsRead).ToList();
            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            var result = messages.Select(m => new MessageReadDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                Timestamp = m.Timestamp,
                ListingId = m.ListingId,
                ListingTitle = m.Listing?.Title,
                IsRead = m.IsRead
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SendMessage([FromBody] MessageSendPayload payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var currentUserId = int.Parse(userIdClaim);

            if (payload.ReceiverId == currentUserId)
            {
                return BadRequest(new { message = "Kendinize mesaj gönderemezsiniz." });
            }

            if (string.IsNullOrWhiteSpace(payload.Content))
            {
                return BadRequest(new { message = "Mesaj içeriği boş olamaz." });
            }

            // Check if receiver exists
            var receiverExists = await _context.Users.AnyAsync(u => u.Id == payload.ReceiverId);
            if (!receiverExists)
            {
                return NotFound(new { message = "Alıcı bulunamadı." });
            }

            var message = new ChatMessage
            {
                SenderId = currentUserId,
                ReceiverId = payload.ReceiverId,
                Content = payload.Content.Trim(),
                Timestamp = DateTime.UtcNow,
                ListingId = payload.ListingId,
                IsRead = false
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            // Load listing title if present
            string? listingTitle = null;
            if (message.ListingId.HasValue)
            {
                var listing = await _context.Listings.FindAsync(message.ListingId.Value);
                listingTitle = listing?.Title;
            }

            var result = new MessageReadDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                Timestamp = message.Timestamp,
                ListingId = message.ListingId,
                ListingTitle = listingTitle,
                IsRead = message.IsRead
            };

            return Ok(result);
        }
    }
}
