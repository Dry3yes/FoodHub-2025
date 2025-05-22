using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Menu
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ItemName { get; set; } = string.Empty;

        [FirestoreProperty]
        public double Price { get; set; }

        [FirestoreProperty]
        public string ImageURL { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Category { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Stock { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }
    }
}