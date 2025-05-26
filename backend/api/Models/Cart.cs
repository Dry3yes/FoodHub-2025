using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Cart
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<CartItem> Items { get; set; } = new List<CartItem>();

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [FirestoreData]
    public class CartItem
    {
        [FirestoreProperty]
        public string MenuId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string MenuItemName { get; set; } = string.Empty;

        [FirestoreProperty]
        public double Price { get; set; }

        [FirestoreProperty]
        public int Quantity { get; set; }

        [FirestoreProperty]
        public string ImageURL { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;
    }
}
