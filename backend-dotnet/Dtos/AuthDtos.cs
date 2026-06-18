using System.Text.Json.Serialization;
using ArtiGida.API.Models;

namespace ArtiGida.API.Dtos
{
    public class UserRegister
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.user;
        public string? ProfilePictureUrl { get; set; }
    }

    public class UserLogin
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserRead
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = "bearer";

        [JsonPropertyName("user")]
        public UserRead User { get; set; } = null!;
    }

    public class UserUpdate
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}
