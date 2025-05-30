namespace api.Dtos.Review
{
    public class CreateReviewDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
        public List<CreateMenuItemReviewDto> MenuItemReviews { get; set; } = new List<CreateMenuItemReviewDto>();
    }

    public class CreateMenuItemReviewDto
    {
        public string MenuId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
    }

    public class ReviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public bool CanEdit { get; set; } // If current user can edit this review
    }

    public class MenuItemReviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string MenuId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public bool CanEdit { get; set; }
    }
    public class SellerRatingDto
    {
        public string SellerId { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<string, int> RatingDistribution { get; set; } = new Dictionary<string, int>();
        public List<ReviewDto> RecentReviews { get; set; } = new List<ReviewDto>();
    }

    public class MenuItemRatingDto
    {
        public string MenuId { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<string, int> RatingDistribution { get; set; } = new Dictionary<string, int>();
        public List<MenuItemReviewDto> RecentReviews { get; set; } = new List<MenuItemReviewDto>();
    }

    public class OrderReviewStatusDto
    {
        public string OrderId { get; set; } = string.Empty;
        public bool HasReviewed { get; set; }
        public bool CanReview { get; set; } // Order is completed and within review window
        public ReviewDto? ExistingReview { get; set; }
        public List<MenuItemReviewDto> ExistingMenuItemReviews { get; set; } = new List<MenuItemReviewDto>();
    }
}
