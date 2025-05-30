using Google.Cloud.Firestore;

namespace api.Models
{
    [FirestoreData]
    public class Review
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string OrderId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string StoreName { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Rating { get; set; } // 1-5 stars

        [FirestoreProperty]
        public string Comment { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<string> Tags { get; set; } = new List<string>(); // e.g., "Fast Service", "Great Food"

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public bool IsVisible { get; set; } = true; // For moderation purposes
    }

    [FirestoreData]
    public class MenuItemReview
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UserName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string OrderId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string MenuId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string MenuItemName { get; set; } = string.Empty;

        [FirestoreProperty]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Rating { get; set; } // 1-5 stars

        [FirestoreProperty]
        public string Comment { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<string> Tags { get; set; } = new List<string>(); // e.g., "Delicious", "Too Salty", "Good Portion"

        [FirestoreProperty]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public bool IsVisible { get; set; } = true;
    }    // Aggregate rating data for quick access
    [FirestoreData]
    public class SellerRating
    {
        [FirestoreDocumentId]
        public string SellerId { get; set; } = string.Empty;

        [FirestoreProperty]
        public double AverageRating { get; set; }

        [FirestoreProperty]
        public int TotalReviews { get; set; }

        [FirestoreProperty]
        public Dictionary<string, int> RatingDistribution { get; set; } = new Dictionary<string, int>
        {
            { "1", 0 }, { "2", 0 }, { "3", 0 }, { "4", 0 }, { "5", 0 }
        };

        [FirestoreProperty]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
    [FirestoreData]
    public class MenuItemRating
    {
        [FirestoreDocumentId]
        public string MenuId { get; set; } = string.Empty;

        [FirestoreProperty]
        public double AverageRating { get; set; }

        [FirestoreProperty]
        public int TotalReviews { get; set; }

        [FirestoreProperty]
        public Dictionary<string, int> RatingDistribution { get; set; } = new Dictionary<string, int>
        {
            { "1", 0 }, { "2", 0 }, { "3", 0 }, { "4", 0 }, { "5", 0 }
        };

        [FirestoreProperty]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
