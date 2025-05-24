using api.Dtos.User;
using api.Models;
using System.Security.Cryptography;
using System.Text;

namespace api.Mappers
{
    public static class UserMappers
    {
        public static UserDto ToUserDto(this User userModel)
        {
            return new UserDto
            {
                UserId = userModel.UserId,
                Name = userModel.Name,
                Email = userModel.Email,
                Role = userModel.Role,
            };
        }

        public static User ToUserFromCreateDto(this CreateUserRequestDto userDto)
        {
            return new User
            {
                Name = userDto.Name,
                Email = userDto.Email,
                Role = userDto.Role,
                Password = userDto.Password, // Store original password for Firebase auth
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
        }

        public static void UpdateUserFromDto(this User user, UpdateUserRequestDto updateDto)
        {
            // Only update properties that are provided in the DTO (not empty)
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                user.Name = updateDto.Name;
            }

            if (!string.IsNullOrEmpty(updateDto.Email))
            {
                user.Email = updateDto.Email;
            }

            if (!string.IsNullOrEmpty(updateDto.Role))
            {
                user.Role = updateDto.Role;
            }

            // Always update IsActive flag since it has a default value
            user.IsActive = updateDto.IsActive;
        }

        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            var hashedInput = HashPassword(password);
            return storedHash.Equals(hashedInput, StringComparison.OrdinalIgnoreCase);
        }
    }
}