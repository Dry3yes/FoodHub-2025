
namespace api.Dtos.User
{
    public class RefreshTokenRequestDto
    {
        public string UserId { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}