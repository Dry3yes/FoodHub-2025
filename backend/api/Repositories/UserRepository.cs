using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;
using FirebaseAdmin.Auth;

namespace api.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly FirestoreDb _firestoreDb;
        public UserRepository(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }

        public async Task<User> CreateAsync(User user)
        {
            await _firestoreDb.Collection("Users").Document(user.UserId.ToString()).SetAsync(user);
            return user;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await Task.FromResult(_firestoreDb.Collection("Users").GetSnapshotAsync().Result.Documents
                .Where(u => u.Exists && u.Id != "init")
                .Select(u => u.ConvertTo<User>())
                .ToList());
        }

        public Task<User?> GetByEmailAsync(string email)
        {
            return Task.FromResult(_firestoreDb.Collection("Users").WhereEqualTo("Email", email).GetSnapshotAsync().Result.Documents
                .Select(u => u.ConvertTo<User>())
                .FirstOrDefault());
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await Task.FromResult(_firestoreDb.Collection("Users").Document(id.ToString()).GetSnapshotAsync().Result.ConvertTo<User>());
        }
    }
}