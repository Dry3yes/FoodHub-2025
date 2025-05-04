using System.ComponentModel.DataAnnotations;

namespace api.Dtos.User
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}