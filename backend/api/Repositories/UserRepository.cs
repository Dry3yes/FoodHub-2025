using api.Interfaces;
using api.Services;
using api.Mappers;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Caching.Memory;
using Firebase.Auth;

namespace api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly FirebaseAuthService _firebaseAuthService;
        private readonly IMemoryCache _cache;
        private readonly ILogger<UserRepository> _logger;
        private const string UsersCacheKey = "AllUsers";
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _refreshTokenExpiration = TimeSpan.FromDays(7);

        public UserRepository(
            FirestoreDb firestoreDb,
            FirebaseAuthService firebaseAuthService,
            IMemoryCache cache,
            ILogger<UserRepository> logger)
        {
            _firestoreDb = firestoreDb;
            _firebaseAuthService = firebaseAuthService;
            _cache = cache;
            _logger = logger;
        }

        public async Task<api.Models.User> CreateAsync(api.Models.User user)
        {
            try
            {
                // Generate a new unique ID
                user.UserId = DateTime.UtcNow.Ticks.ToString() + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);

                // Store the password before hashing for Firebase auth
                var originalPassword = user.Password;

                // Hash the password for our storage
                user.PasswordHash = UserMappers.HashPassword(user.Password);
                user.Password = string.Empty; // Clear the plain text password

                // Create Firebase auth user with original password and role
                var (token, refreshToken, firebaseUid) = await _firebaseAuthService.RegisterUserAsync(user.Email, originalPassword, user.Role);

                // Store the Firebase UID
                user.FirebaseUid = firebaseUid;

                // Update refresh token
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_refreshTokenExpiration);

                // Store user in Firestore
                await _firestoreDb.Collection("Users").Document(user.UserId).SetAsync(user);

                // Invalidate cache
                _cache.Remove(UsersCacheKey);

                _logger.LogInformation("User created successfully: {UserId}", user.UserId);
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user: {UserId}", user.UserId);
                throw;
            }
        }

        public async Task<IEnumerable<api.Models.User>> GetAllAsync()
        {
            try
            {
                if (_cache.TryGetValue<IEnumerable<api.Models.User>>(UsersCacheKey, out var cachedUsers) && cachedUsers != null)
                {
                    return cachedUsers;
                }

                var snapshot = await _firestoreDb.Collection("Users").GetSnapshotAsync();
                var users = snapshot.Documents
                    .Where(u => u.Exists && u.Id != "init")
                    .Select(u => u.ConvertTo<api.Models.User>())
                    .ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(_cacheDuration)
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(UsersCacheKey, users, cacheOptions);

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<api.Models.User?> GetByEmailAsync(string email)
        {
            try
            {
                var users = await GetAllAsync();
                return users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by email: {Email}", email);
                throw;
            }
        }

        public async Task<api.Models.User?> GetByIdAsync(string id)
        {
            try
            {
                var userRef = _firestoreDb.Collection("Users").Document(id);
                var snapshot = await userRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                {
                    _logger.LogWarning("User not found: {UserId}", id);
                    return null;
                }

                return snapshot.ConvertTo<api.Models.User>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user by ID: {UserId}", id);
                throw;
            }
        }

        public async Task<(api.Models.User? User, string? Token)> LoginAsync(string email, string password)
        {
            try
            {
                // First try Firebase authentication
                try
                {
                    // Get the user from our database first to check if they exist
                    var user = await GetByEmailAsync(email);
                    if (user == null || !user.IsActive)
                    {
                        return (null, null);
                    }

                    var (token, refreshToken, firebaseUid) = await _firebaseAuthService.LoginUserAsync(email, password);

                    // Update Firebase UID if it's not set (for existing users)
                    if (string.IsNullOrEmpty(user.FirebaseUid))
                    {
                        user.FirebaseUid = firebaseUid;
                    }

                    // Ensure the role claim is set properly using Firebase UID
                    await _firebaseAuthService.SetUserRoleAsync(user.FirebaseUid, user.Role);

                    // Update refresh token and last login
                    user.RefreshToken = refreshToken;
                    user.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_refreshTokenExpiration);
                    user.LastLoginAt = DateTime.UtcNow;

                    await UpdateUserAsync(user);
                    return (user, token);
                }
                catch (FirebaseAuthException)
                {
                    // If Firebase auth fails, try local password verification as fallback
                    var user = await GetByEmailAsync(email);
                    if (user == null || !user.IsActive)
                    {
                        return (null, null);
                    }

                    if (!UserMappers.VerifyPassword(password, user.PasswordHash))
                    {
                        _logger.LogWarning("Invalid password attempt for user: {Email}", email);
                        return (null, null);
                    }

                    // If local verification succeeds, recreate Firebase user
                    var (token, refreshToken, firebaseUid) = await _firebaseAuthService.RegisterUserAsync(email, password, user.Role);

                    user.FirebaseUid = firebaseUid;
                    user.RefreshToken = refreshToken;
                    user.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_refreshTokenExpiration);
                    user.LastLoginAt = DateTime.UtcNow;

                    await UpdateUserAsync(user);
                    return (user, token);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login: {Email}", email);
                throw;
            }
        }
        public async Task<bool> UpdateUserAsync(api.Models.User user)
        {
            try
            {
                var userRef = _firestoreDb.Collection("Users").Document(user.UserId);
                await userRef.SetAsync(user, SetOptions.MergeAll);

                _cache.Remove(UsersCacheKey);

                _logger.LogInformation("User updated successfully: {UserId}", user.UserId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {UserId}", user.UserId);
                throw;
            }
        }

        public async Task<bool> UpdateUserWithEmailAsync(api.Models.User originalUser, api.Models.User updatedUser)
        {
            try
            {
                // Check if email is being updated
                bool emailChanged = !string.IsNullOrEmpty(updatedUser.Email) &&
                                  !updatedUser.Email.Equals(originalUser.Email, StringComparison.OrdinalIgnoreCase);

                if (emailChanged && !string.IsNullOrEmpty(originalUser.FirebaseUid))
                {
                    // Update email in Firebase Authentication
                    var emailUpdateSuccess = await _firebaseAuthService.UpdateEmailInFirebaseAsync(
                        originalUser.FirebaseUid,
                        updatedUser.Email
                    );

                    if (!emailUpdateSuccess)
                    {
                        _logger.LogError("Failed to update email in Firebase for user: {UserId}", updatedUser.UserId);
                        return false;
                    }
                }

                // Update user in Firestore
                var userRef = _firestoreDb.Collection("Users").Document(updatedUser.UserId);
                await userRef.SetAsync(updatedUser, SetOptions.MergeAll);

                _cache.Remove(UsersCacheKey);

                _logger.LogInformation("User updated successfully with email sync: {UserId}", updatedUser.UserId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with email sync: {UserId}", updatedUser.UserId);
                throw;
            }
        }

        public async Task<(string? Token, string? RefreshToken)> RefreshTokenAsync(string userId, string refreshToken)
        {
            try
            {
                var user = await GetByIdAsync(userId);
                if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    return (null, null);
                }

                var newToken = await _firebaseAuthService.RefreshTokenAsync(refreshToken);
                var newRefreshToken = Guid.NewGuid().ToString();

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_refreshTokenExpiration);

                await UpdateUserAsync(user);

                return (newToken, newRefreshToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token for user: {UserId}", userId);
                throw;
            }
        }
    }
}