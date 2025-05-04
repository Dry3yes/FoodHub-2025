using api.Models;

namespace api.Interfaces
{
    public interface IUserRepository
    {
        Task<User> CreateAsync(User user);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task<(User? User, string? Token)> LoginAsync(string email, string password);
        Task<bool> UpdateUserAsync(User user);
        Task<(string? Token, string? RefreshToken)> RefreshTokenAsync(string userId, string refreshToken);
    }
}