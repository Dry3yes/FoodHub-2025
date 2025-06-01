using Microsoft.AspNetCore.SignalR;
using api.Interfaces;
using System.Security.Claims;

namespace api.Services
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        private readonly IServiceProvider _serviceProvider;

        public CustomUserIdProvider(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public string? GetUserId(HubConnectionContext connection)
        {
            try
            {
                // Get Firebase UID from JWT claims
                var firebaseUid = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                                 connection.User?.FindFirst("uid")?.Value;

                if (string.IsNullOrEmpty(firebaseUid))
                {
                    Console.WriteLine("No Firebase UID found in claims");
                    return null;
                }

                // Create a scope to get the user repository
                using var scope = _serviceProvider.CreateScope();
                var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();

                // Get the User document ID from Firestore using Firebase UID
                var users = userRepository.GetAllAsync().Result;
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);

                var userId = user?.UserId ?? string.Empty;
                Console.WriteLine($"CustomUserIdProvider: Firebase UID {firebaseUid} mapped to User ID {userId}");

                return string.IsNullOrEmpty(userId) ? null : userId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CustomUserIdProvider: {ex.Message}");
                return null;
            }
        }
    }
}
