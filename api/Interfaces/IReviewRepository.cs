using api.Models;

namespace api.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review> CreateReviewAsync(Review review);
        Task<Review?> GetReviewByIdAsync(string reviewId);
        Task<IEnumerable<Review>> GetReviewsByMenuItemIdAsync(int menuItemId);
        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId);
        Task<Review> UpdateReviewAsync(Review review);
        Task<bool> DeleteReviewAsync(string reviewId);
        Task<bool> HasUserReviewedOrder(string userId, string orderId);
        Task<double> GetAverageRatingForMenuItemAsync(int menuItemId);
    }
}