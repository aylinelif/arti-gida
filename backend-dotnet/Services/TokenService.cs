using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ArtiGida.API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ArtiGida.API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateAccessToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var keyBytes = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "artigida_jwt_secret_key_long_enough_to_be_secure_32_bytes");
            var key = new SymmetricSecurityKey(keyBytes);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("role", user.Role.ToString())
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddDays(7); // matching a standard session length, or customize

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "ArtiGidaAPI",
                audience: jwtSettings["Audience"] ?? "ArtiGidaAngular",
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
