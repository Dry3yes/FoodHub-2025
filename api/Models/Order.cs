using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Order
    {
        [FirestoreDocumentId]
        public string OrderId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<OrderItem> Items { get; set; } = new();

        [FirestoreProperty]
        public string Status { get; set; } = "Pending"; // Pending, Processing, Ready, Completed, Cancelled

        [FirestoreProperty]
        public double TotalAmount { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime? UpdatedAt { get; set; }

        [FirestoreProperty]
        public string? Note { get; set; }
    }

    [FirestoreData]
    public class OrderItem
    {
        [FirestoreProperty]
        public int MenuItemId { get; set; }

        [FirestoreProperty]
        public string ItemName { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Quantity { get; set; }

        [FirestoreProperty]
        public double Price { get; set; }

        [FirestoreProperty]
        public double Subtotal { get; set; }
    }
}