using api.Dtos.Review;
using api.Models;

namespace api.Interfaces
{
    public interface IReviewRepository
    {
        // Review CRUD operations
        Task<Review?> CreateReviewAsync(Review review);
        Task<Review?> GetReviewByIdAsync(string reviewId);
        Task<Review?> GetReviewByOrderIdAsync(string orderId, string userId);
        Task<List<Review>> GetReviewsBySellerIdAsync(string sellerId, int limit = 10, int offset = 0);
        Task<Review?> UpdateReviewAsync(string reviewId, Review review);
        Task<bool> DeleteReviewAsync(string reviewId);

        // Menu Item Review CRUD operations
        Task<MenuItemReview?> CreateMenuItemReviewAsync(MenuItemReview menuItemReview);
        Task<List<MenuItemReview>> GetMenuItemReviewsByOrderIdAsync(string orderId, string userId);
        Task<List<MenuItemReview>> GetMenuItemReviewsByMenuIdAsync(string menuId, int limit = 10, int offset = 0);
        Task<MenuItemReview?> UpdateMenuItemReviewAsync(string reviewId, MenuItemReview menuItemReview);
        Task<bool> DeleteMenuItemReviewAsync(string reviewId);

        // Rating aggregation operations
        Task<SellerRating?> GetSellerRatingAsync(string sellerId);
        Task<MenuItemRating?> GetMenuItemRatingAsync(string menuId);
        Task UpdateSellerRatingAsync(string sellerId);
        Task UpdateMenuItemRatingAsync(string menuId);

        // Helper methods
        Task<bool> HasUserReviewedOrderAsync(string orderId, string userId);
        Task<bool> CanUserReviewOrderAsync(string orderId, string userId);
        Task<List<Review>> GetRecentReviewsAsync(int limit = 10);
        Task<List<MenuItemReview>> GetRecentMenuItemReviewsAsync(int limit = 10);
    }
}
