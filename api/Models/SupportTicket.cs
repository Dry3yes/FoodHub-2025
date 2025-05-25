using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class SupportTicket
    {
        [FirestoreDocumentId]
        public string? Id { get; set; }

        [FirestoreProperty]
        public string TicketId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string? UserId { get; set; } // Nullable for anonymous submissions

        [FirestoreProperty]
        public string Name { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserType { get; set; } = string.Empty; // customer, seller, delivery

        [FirestoreProperty]
        public string Category { get; set; } = string.Empty; // general, account, orders, etc.

        [FirestoreProperty]
        public string Subject { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Description { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Status { get; set; } = string.Empty; // open, in-progress, resolved, closed

        [FirestoreProperty]
        public string? AdminResponse { get; set; }

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty]
        public DateTime? UpdatedAt { get; set; }
    }
}
