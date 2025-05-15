using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Review
    {
        [FirestoreDocumentId]
        public string ReviewId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public int MenuItemId { get; set; }

        [FirestoreProperty]
        public string OrderId { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Rating { get; set; }

        [FirestoreProperty]
        public string Comment { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime? UpdatedAt { get; set; }

        [FirestoreProperty]
        public bool IsVerifiedPurchase { get; set; }
    }
}