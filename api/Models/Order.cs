using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Order
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();

        [FirestoreProperty]
        public string Notes { get; set; } = string.Empty;

        [FirestoreProperty]
        public double Total { get; set; }

        [FirestoreProperty]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [FirestoreProperty]
        public string PaymentProofUrl { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [FirestoreData]
    public class OrderItem
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
    }

    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Ready,
        Completed,
        Cancelled
    }
}
