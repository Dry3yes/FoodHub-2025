using System;
using System.ComponentModel.DataAnnotations;
using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class User
    {
        [FirestoreDocumentId]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty("firebaseUid")]
        public string FirebaseUid { get; set; } = string.Empty;

        [FirestoreProperty("name")]
        [Required]
        public string Name { get; set; } = string.Empty;

        [FirestoreProperty("email")]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        // Not stored in Firestore, used only during registration/login
        public string Password { get; set; } = string.Empty;

        [FirestoreProperty("role")]
        public string Role { get; set; } = "User";

        [FirestoreProperty("refreshToken")]
        public string RefreshToken { get; set; } = string.Empty;

        [FirestoreProperty("refreshTokenExpiryTime")]
        public DateTime RefreshTokenExpiryTime { get; set; }

        [FirestoreProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty("lastLoginAt")]
        public DateTime? LastLoginAt { get; set; }

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;
    }
}