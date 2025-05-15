using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Caching.Memory;

namespace api.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<ReviewRepository> _logger;
        private readonly IMemoryCache _cache;
        private const string ReviewsCachePrefix = "Reviews_";
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);

        public ReviewRepository(
            FirestoreDb firestoreDb,
            ILogger<ReviewRepository> logger,
            IMemoryCache cache)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
            _cache = cache;
        }

        public async Task<Review> CreateReviewAsync(Review review)
        {
            try
            {
                review.ReviewId = Guid.NewGuid().ToString();
                await _firestoreDb.Collection("Reviews").Document(review.ReviewId).SetAsync(review);
                
                // Invalidate cache for this menu item's reviews
                _cache.Remove($"{ReviewsCachePrefix}MenuItem_{review.MenuItemId}");
                
                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for menu item: {MenuItemId}", review.MenuItemId);
                throw;
            }
        }

        public async Task<Review?> GetReviewByIdAsync(string reviewId)
        {
            try
            {
                var snapshot = await _firestoreDb.Collection("Reviews").Document(reviewId).GetSnapshotAsync();
                return snapshot.Exists ? snapshot.ConvertTo<Review>() : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review: {ReviewId}", reviewId);
                throw;
            }
        }

        public async Task<IEnumerable<Review>> GetReviewsByMenuItemIdAsync(int menuItemId)
        {
            try
            {
                string cacheKey = $"{ReviewsCachePrefix}MenuItem_{menuItemId}";
                if (_cache.TryGetValue<IEnumerable<Review>>(cacheKey, out var cachedReviews))
                {
                    return cachedReviews;
                }

                var query = _firestoreDb.Collection("Reviews").WhereEqualTo("MenuItemId", menuItemId);
                var snapshot = await query.GetSnapshotAsync();
                var reviews = snapshot.Documents.Select(d => d.ConvertTo<Review>()).OrderByDescending(r => r.CreatedAt);

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(_cacheDuration);
                _cache.Set(cacheKey, reviews, cacheOptions);

                return reviews;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for menu item: {MenuItemId}", menuItemId);
                throw;
            }
        }

        public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(string userId)
        {
            try
            {
                var query = _firestoreDb.Collection("Reviews").WhereEqualTo("UserId", userId);
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(d => d.ConvertTo<Review>()).OrderByDescending(r => r.CreatedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Review> UpdateReviewAsync(Review review)
        {
            try
            {
                review.UpdatedAt = DateTime.UtcNow;
                await _firestoreDb.Collection("Reviews").Document(review.ReviewId).SetAsync(review);
                
                // Invalidate cache for this menu item's reviews
                _cache.Remove($"{ReviewsCachePrefix}MenuItem_{review.MenuItemId}");
                
                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review: {ReviewId}", review.ReviewId);
                throw;
            }
        }

        public async Task<bool> DeleteReviewAsync(string reviewId)
        {
            try
            {
                var review = await GetReviewByIdAsync(reviewId);
                if (review == null) return false;

                await _firestoreDb.Collection("Reviews").Document(reviewId).DeleteAsync();
                
                // Invalidate cache for this menu item's reviews
                _cache.Remove($"{ReviewsCachePrefix}MenuItem_{review.MenuItemId}");
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review: {ReviewId}", reviewId);
                throw;
            }
        }

        public async Task<bool> HasUserReviewedOrder(string userId, string orderId)
        {
            try
            {
                var query = _firestoreDb.Collection("Reviews")
                    .WhereEqualTo("UserId", userId)
                    .WhereEqualTo("OrderId", orderId);
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Any();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user has reviewed order: {UserId}, {OrderId}", userId, orderId);
                throw;
            }
        }

        public async Task<double> GetAverageRatingForMenuItemAsync(int menuItemId)
        {
            try
            {
                var reviews = await GetReviewsByMenuItemIdAsync(menuItemId);
                if (!reviews.Any()) return 0;
                
                return Math.Round(reviews.Average(r => r.Rating), 1);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating average rating for menu item: {MenuItemId}", menuItemId);
                throw;
            }
        }
    }
}