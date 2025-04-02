using api.Interfaces;
using api.Models;
using api.Services;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly FirebaseAuthService _firebaseAuthService;
        public UserRepository(FirestoreDb firestoreDb, FirebaseAuthService firebaseAuthService)
        {
            _firestoreDb = firestoreDb;
            _firebaseAuthService = firebaseAuthService;
        }

        public async Task<User> CreateAsync(User user)
        {
            await _firestoreDb.Collection("Users").Document(user.UserId.ToString()).SetAsync(user);
            return user;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await Task.FromResult(_firestoreDb.Collection("Users").GetSnapshotAsync().Result.Documents
                .Where(u => u.Exists && u.Id != "init")
                .Select(u => u.ConvertTo<User>())
                .ToList());
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await Task.FromResult(_firestoreDb.Collection("Users").WhereEqualTo("Email", email).GetSnapshotAsync().Result.Documents
                .Select(u => u.ConvertTo<User>())
                .FirstOrDefault());
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var userRef = _firestoreDb.Collection("Users").Document(id.ToString());
            var snapshot = await userRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<User>();
            }
            return null;
        }

        public async Task<(User? User, string? Token)> LoginAsync(string email, string password)
        {
            var token = await _firebaseAuthService.LoginUserAsync(email, password);
            var user = await GetByEmailAsync(email);
            if (user != null)
            {
                return (user, token);
            }
            return (null, null);
        }
    }
}