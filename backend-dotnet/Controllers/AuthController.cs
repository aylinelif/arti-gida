using System;
using System.IdentityModel.Tokens.Jwt;
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
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TokenResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] UserRegister payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Email) || string.IsNullOrWhiteSpace(payload.Password))
            {
                return BadRequest(new { detail = "E-posta ve şifre gereklidir." });
            }

            var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == payload.Email.ToLower());
            if (existing)
            {
                return BadRequest(new { detail = "Bu e-posta adresi zaten kayıtlı." });
            }

            var user = new User
            {
                Name = payload.Name,
                Email = payload.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(payload.Password),
                Role = payload.Role,
                ProfilePictureUrl = payload.ProfilePictureUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.CreateAccessToken(user);

            var response = new TokenResponse
            {
                AccessToken = token,
                User = new UserRead
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    ProfilePictureUrl = user.ProfilePictureUrl
                }
            };

            return Created("", response);
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TokenResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] UserLogin payload)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == payload.Email.ToLower());
            if (user == null || !BCrypt.Net.BCrypt.Verify(payload.Password, user.PasswordHash))
            {
                return Unauthorized(new { detail = "E-posta veya şifre hatalı." });
            }

            var token = _tokenService.CreateAccessToken(user);

            var response = new TokenResponse
            {
                AccessToken = token,
                User = new UserRead
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    ProfilePictureUrl = user.ProfilePictureUrl
                }
            };

            return Ok(response);
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserRead))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { detail = "Kimlik doğrulaması başarısız." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { detail = "Kullanıcı bulunamadı." });
            }

            var response = new UserRead
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl
            };

            return Ok(response);
        }

        [HttpPut("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TokenResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateMe([FromBody] UserUpdate payload)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { detail = "Kimlik doğrulaması başarısız." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { detail = "Kullanıcı bulunamadı." });
            }

            if (!string.IsNullOrWhiteSpace(payload.Email) && payload.Email.ToLower() != user.Email.ToLower())
            {
                var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == payload.Email.ToLower() && u.Id != userId);
                if (existing)
                {
                    return BadRequest(new { detail = "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor." });
                }
                user.Email = payload.Email;
            }

            if (!string.IsNullOrWhiteSpace(payload.Name))
            {
                user.Name = payload.Name;
            }

            if (!string.IsNullOrWhiteSpace(payload.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(payload.Password);
            }

            if (payload.ProfilePictureUrl != null)
            {
                user.ProfilePictureUrl = payload.ProfilePictureUrl;
            }

            await _context.SaveChangesAsync();

            var token = _tokenService.CreateAccessToken(user);

            var response = new TokenResponse
            {
                AccessToken = token,
                User = new UserRead
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    ProfilePictureUrl = user.ProfilePictureUrl
                }
            };

            return Ok(response);
        }
    }
}
