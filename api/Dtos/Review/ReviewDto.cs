namespace api.Dtos.Review
{
    public class ReviewDto
    {
        public string ReviewId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int MenuItemId { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsVerifiedPurchase { get; set; }
    }

    public class CreateReviewDto
    {
        public int MenuItemId { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateReviewDto
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}