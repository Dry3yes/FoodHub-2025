using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class SellerApplication
    {
        [FirestoreDocumentId]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreDocumentId]
        public string ApplicationId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserIdentificationNumber { get; set; } = string.Empty;

        [FirestoreProperty]
        public string IdentificationUrl { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        [FirestoreProperty]
        public string? AdminMessage { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime? ProcessedAt { get; set; }
    }

    [FirestoreData]
    public class Seller
    {
        [FirestoreDocumentId]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserIdentificationNumber { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Status { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }
    }
}