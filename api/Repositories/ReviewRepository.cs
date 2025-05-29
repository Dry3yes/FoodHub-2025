using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly FirestoreDb _db;
        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<ReviewRepository> _logger;

        public ReviewRepository(FirestoreDb db, IOrderRepository orderRepository, ILogger<ReviewRepository> logger)
        {
            _db = db;
            _orderRepository = orderRepository;
            _logger = logger;
        }

        public async Task<Review?> CreateReviewAsync(Review review)
        {
            try
            {
                // Check if user already reviewed this order
                if (await HasUserReviewedOrderAsync(review.OrderId, review.UserId))
                {
                    return null;
                }

                var docRef = _db.Collection("reviews").Document();
                review.Id = docRef.Id;
                review.CreatedAt = DateTime.UtcNow;
                review.UpdatedAt = DateTime.UtcNow;

                await docRef.SetAsync(review);

                // Update seller rating aggregation
                await UpdateSellerRatingAsync(review.SellerId);

                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return null;
            }
        }

        public async Task<Review?> GetReviewByIdAsync(string reviewId)
        {
            try
            {
                var docRef = _db.Collection("reviews").Document(reviewId);
                var snapshot = await docRef.GetSnapshotAsync();

                if (snapshot.Exists)
                {
                    return snapshot.ConvertTo<Review>();
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review by ID: {ReviewId}", reviewId);
                return null;
            }
        }

        public async Task<Review?> GetReviewByOrderIdAsync(string orderId, string userId)
        {
            try
            {
                var query = _db.Collection("reviews")
                    .WhereEqualTo("OrderId", orderId)
                    .WhereEqualTo("UserId", userId)
                    .Limit(1);

                var snapshot = await query.GetSnapshotAsync();

                if (snapshot.Documents.Count > 0)
                {
                    return snapshot.Documents[0].ConvertTo<Review>();
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review by order ID: {OrderId}", orderId);
                return null;
            }
        }

        public async Task<List<Review>> GetReviewsBySellerIdAsync(string sellerId, int limit = 10, int offset = 0)
        {
            try
            {
                var query = _db.Collection("reviews")
                    .WhereEqualTo("SellerId", sellerId)
                    .WhereEqualTo("IsVisible", true)
                    .OrderByDescending("CreatedAt")
                    .Offset(offset)
                    .Limit(limit);

                var snapshot = await query.GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.ConvertTo<Review>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews by seller ID: {SellerId}", sellerId);
                return new List<Review>();
            }
        }

        public async Task<MenuItemReview?> CreateMenuItemReviewAsync(MenuItemReview menuItemReview)
        {
            try
            {
                var docRef = _db.Collection("menuItemReviews").Document();
                menuItemReview.Id = docRef.Id;
                menuItemReview.CreatedAt = DateTime.UtcNow;
                menuItemReview.UpdatedAt = DateTime.UtcNow;

                await docRef.SetAsync(menuItemReview);

                // Update menu item rating aggregation
                await UpdateMenuItemRatingAsync(menuItemReview.MenuId);

                return menuItemReview;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu item review");
                return null;
            }
        }

        public async Task<List<MenuItemReview>> GetMenuItemReviewsByOrderIdAsync(string orderId, string userId)
        {
            try
            {
                var query = _db.Collection("menuItemReviews")
                    .WhereEqualTo("OrderId", orderId)
                    .WhereEqualTo("UserId", userId);

                var snapshot = await query.GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.ConvertTo<MenuItemReview>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting menu item reviews by order ID: {OrderId}", orderId);
                return new List<MenuItemReview>();
            }
        }

        public async Task<List<MenuItemReview>> GetMenuItemReviewsByMenuIdAsync(string menuId, int limit = 10, int offset = 0)
        {
            try
            {
                var query = _db.Collection("menuItemReviews")
                    .WhereEqualTo("MenuId", menuId)
                    .WhereEqualTo("IsVisible", true)
                    .OrderByDescending("CreatedAt")
                    .Offset(offset)
                    .Limit(limit);

                var snapshot = await query.GetSnapshotAsync();

                return snapshot.Documents.Select(doc => doc.ConvertTo<MenuItemReview>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting menu item reviews by menu ID: {MenuId}", menuId);
                return new List<MenuItemReview>();
            }
        }

        public async Task<SellerRating?> GetSellerRatingAsync(string sellerId)
        {
            try
            {
                var docRef = _db.Collection("sellerRatings").Document(sellerId);
                var snapshot = await docRef.GetSnapshotAsync();

                if (snapshot.Exists)
                {
                    return snapshot.ConvertTo<SellerRating>();
                }

                return new SellerRating { SellerId = sellerId };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller rating: {SellerId}", sellerId);
                return null;
            }
        }

        public async Task<MenuItemRating?> GetMenuItemRatingAsync(string menuId)
        {
            try
            {
                var docRef = _db.Collection("menuItemRatings").Document(menuId);
                var snapshot = await docRef.GetSnapshotAsync();

                if (snapshot.Exists)
                {
                    return snapshot.ConvertTo<MenuItemRating>();
                }

                return new MenuItemRating { MenuId = menuId };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting menu item rating: {MenuId}", menuId);
                return null;
            }
        }

        public async Task UpdateSellerRatingAsync(string sellerId)
        {
            try
            {
                var query = _db.Collection("reviews")
                    .WhereEqualTo("SellerId", sellerId)
                    .WhereEqualTo("IsVisible", true);

                var snapshot = await query.GetSnapshotAsync();
                var reviews = snapshot.Documents.Select(doc => doc.ConvertTo<Review>()).ToList();

                if (reviews.Count == 0)
                {
                    return;
                }

                var sellerRating = new SellerRating
                {
                    SellerId = sellerId,
                    TotalReviews = reviews.Count,
                    AverageRating = reviews.Average(r => r.Rating),
                    LastUpdated = DateTime.UtcNow
                };

                // Calculate rating distribution
                foreach (var review in reviews)
                {
                    if (sellerRating.RatingDistribution.ContainsKey(review.Rating))
                    {
                        sellerRating.RatingDistribution[review.Rating]++;
                    }
                }

                var docRef = _db.Collection("sellerRatings").Document(sellerId);
                await docRef.SetAsync(sellerRating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating seller rating: {SellerId}", sellerId);
            }
        }

        public async Task UpdateMenuItemRatingAsync(string menuId)
        {
            try
            {
                var query = _db.Collection("menuItemReviews")
                    .WhereEqualTo("MenuId", menuId)
                    .WhereEqualTo("IsVisible", true);

                var snapshot = await query.GetSnapshotAsync();
                var reviews = snapshot.Documents.Select(doc => doc.ConvertTo<MenuItemReview>()).ToList();

                if (reviews.Count == 0)
                {
                    return;
                }

                var menuItemRating = new MenuItemRating
                {
                    MenuId = menuId,
                    TotalReviews = reviews.Count,
                    AverageRating = reviews.Average(r => r.Rating),
                    LastUpdated = DateTime.UtcNow
                };

                // Calculate rating distribution
                foreach (var review in reviews)
                {
                    if (menuItemRating.RatingDistribution.ContainsKey(review.Rating))
                    {
                        menuItemRating.RatingDistribution[review.Rating]++;
                    }
                }

                var docRef = _db.Collection("menuItemRatings").Document(menuId);
                await docRef.SetAsync(menuItemRating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating menu item rating: {MenuId}", menuId);
            }
        }

        public async Task<bool> HasUserReviewedOrderAsync(string orderId, string userId)
        {
            try
            {
                var query = _db.Collection("reviews")
                    .WhereEqualTo("OrderId", orderId)
                    .WhereEqualTo("UserId", userId)
                    .Limit(1);

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user reviewed order: {OrderId}", orderId);
                return false;
            }
        }

        public async Task<bool> CanUserReviewOrderAsync(string orderId, string userId)
        {
            try
            {
                // Check if order is completed
                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null || order.Status != OrderStatus.Completed || order.UserId != userId)
                {
                    return false;
                }

                // Check if user already reviewed
                if (await HasUserReviewedOrderAsync(orderId, userId))
                {
                    return false;
                }

                // Check if within review window (e.g., 30 days)
                var reviewWindow = TimeSpan.FromDays(30);
                if (DateTime.UtcNow - order.UpdatedAt > reviewWindow)
                {
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user can review order: {OrderId}", orderId);
                return false;
            }
        }

        public async Task<List<Review>> GetRecentReviewsAsync(int limit = 10)
        {
            try
            {
                var query = _db.Collection("reviews")
                    .WhereEqualTo("IsVisible", true)
                    .OrderByDescending("CreatedAt")
                    .Limit(limit);

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<Review>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent reviews");
                return new List<Review>();
            }
        }

        public async Task<List<MenuItemReview>> GetRecentMenuItemReviewsAsync(int limit = 10)
        {
            try
            {
                var query = _db.Collection("menuItemReviews")
                    .WhereEqualTo("IsVisible", true)
                    .OrderByDescending("CreatedAt")
                    .Limit(limit);

                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(doc => doc.ConvertTo<MenuItemReview>()).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent menu item reviews");
                return new List<MenuItemReview>();
            }
        }

        // Additional helper methods for updating and deleting reviews
        public async Task<Review?> UpdateReviewAsync(string reviewId, Review review)
        {
            try
            {
                review.UpdatedAt = DateTime.UtcNow;
                var docRef = _db.Collection("reviews").Document(reviewId);
                await docRef.SetAsync(review);

                // Update seller rating aggregation
                await UpdateSellerRatingAsync(review.SellerId);

                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review: {ReviewId}", reviewId);
                return null;
            }
        }

        public async Task<bool> DeleteReviewAsync(string reviewId)
        {
            try
            {
                var docRef = _db.Collection("reviews").Document(reviewId);
                await docRef.DeleteAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review: {ReviewId}", reviewId);
                return false;
            }
        }

        public async Task<MenuItemReview?> UpdateMenuItemReviewAsync(string reviewId, MenuItemReview menuItemReview)
        {
            try
            {
                menuItemReview.UpdatedAt = DateTime.UtcNow;
                var docRef = _db.Collection("menuItemReviews").Document(reviewId);
                await docRef.SetAsync(menuItemReview);

                // Update menu item rating aggregation
                await UpdateMenuItemRatingAsync(menuItemReview.MenuId);

                return menuItemReview;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating menu item review: {ReviewId}", reviewId);
                return null;
            }
        }

        public async Task<bool> DeleteMenuItemReviewAsync(string reviewId)
        {
            try
            {
                var docRef = _db.Collection("menuItemReviews").Document(reviewId);
                await docRef.DeleteAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting menu item review: {ReviewId}", reviewId);
                return false;
            }
        }
    }
}
