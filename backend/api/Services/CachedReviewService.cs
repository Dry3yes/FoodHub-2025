using api.Interfaces;
using api.Models;
using api.Services;

namespace api.Services
{
    public interface ICachedReviewService
    {
        Task<List<Review>> GetReviewsBySellerIdAsync(string sellerId, int limit, int offset);
        Task<SellerRating?> GetSellerRatingAsync(string sellerId);
        Task<List<MenuItemReview>> GetMenuItemReviewsByMenuIdAsync(string menuId, int limit, int offset);
        Task<MenuItemRating?> GetMenuItemRatingAsync(string menuId);
        Task InvalidateSellerCacheAsync(string sellerId);
        Task InvalidateMenuCacheAsync(string menuId);
        Task InvalidateAllReviewCachesAsync();
    }

    public class CachedReviewService : ICachedReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedReviewService> _logger;

        // Cache key patterns
        private const string SELLER_REVIEWS_KEY = "reviews:seller:{0}:limit:{1}:offset:{2}";
        private const string SELLER_RATING_KEY = "rating:seller:{0}";
        private const string MENU_REVIEWS_KEY = "reviews:menu:{0}:limit:{1}:offset:{2}";
        private const string MENU_RATING_KEY = "rating:menu:{0}";

        public CachedReviewService(
            IReviewRepository reviewRepository,
            ICacheService cacheService,
            ILogger<CachedReviewService> logger)
        {
            _reviewRepository = reviewRepository;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<List<Review>> GetReviewsBySellerIdAsync(string sellerId, int limit, int offset)
        {
            var cacheKey = string.Format(SELLER_REVIEWS_KEY, sellerId, limit, offset);

            var cached = await _cacheService.GetAsync<List<Review>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for seller reviews: {SellerId}", sellerId);
                return cached;
            }

            _logger.LogDebug("Cache miss for seller reviews: {SellerId}, fetching from database", sellerId);
            var reviews = await _reviewRepository.GetReviewsBySellerIdAsync(sellerId, limit, offset);

            // Cache for 3 minutes for paginated results, 5 minutes for first page
            var cacheExpiration = offset == 0 ? TimeSpan.FromMinutes(5) : TimeSpan.FromMinutes(3);
            await _cacheService.SetAsync(cacheKey, reviews, cacheExpiration);

            return reviews;
        }

        public async Task<SellerRating?> GetSellerRatingAsync(string sellerId)
        {
            var cacheKey = string.Format(SELLER_RATING_KEY, sellerId);

            var cached = await _cacheService.GetAsync<SellerRating>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for seller rating: {SellerId}", sellerId);
                return cached;
            }

            _logger.LogDebug("Cache miss for seller rating: {SellerId}, fetching from database", sellerId);
            var rating = await _reviewRepository.GetSellerRatingAsync(sellerId);

            if (rating != null)
            {
                // Cache seller ratings for longer since they change less frequently
                await _cacheService.SetAsync(cacheKey, rating, TimeSpan.FromMinutes(10));
            }

            return rating;
        }

        public async Task<List<MenuItemReview>> GetMenuItemReviewsByMenuIdAsync(string menuId, int limit, int offset)
        {
            var cacheKey = string.Format(MENU_REVIEWS_KEY, menuId, limit, offset);

            var cached = await _cacheService.GetAsync<List<MenuItemReview>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menu reviews: {MenuId}", menuId);
                return cached;
            }

            _logger.LogDebug("Cache miss for menu reviews: {MenuId}, fetching from database", menuId);
            var reviews = await _reviewRepository.GetMenuItemReviewsByMenuIdAsync(menuId, limit, offset);

            // Cache for 3 minutes for paginated results, 5 minutes for first page
            var cacheExpiration = offset == 0 ? TimeSpan.FromMinutes(5) : TimeSpan.FromMinutes(3);
            await _cacheService.SetAsync(cacheKey, reviews, cacheExpiration);

            return reviews;
        }

        public async Task<MenuItemRating?> GetMenuItemRatingAsync(string menuId)
        {
            var cacheKey = string.Format(MENU_RATING_KEY, menuId);

            var cached = await _cacheService.GetAsync<MenuItemRating>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menu rating: {MenuId}", menuId);
                return cached;
            }

            _logger.LogDebug("Cache miss for menu rating: {MenuId}, fetching from database", menuId);
            var rating = await _reviewRepository.GetMenuItemRatingAsync(menuId);

            if (rating != null)
            {
                // Cache menu ratings for longer since they change less frequently
                await _cacheService.SetAsync(cacheKey, rating, TimeSpan.FromMinutes(10));
            }

            return rating;
        }

        public async Task InvalidateSellerCacheAsync(string sellerId)
        {
            try
            {
                // Invalidate all cache entries related to this seller
                await _cacheService.RemoveByPatternAsync($"seller:{sellerId}");
                _logger.LogInformation("Invalidated cache for seller: {SellerId}", sellerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating seller cache: {SellerId}", sellerId);
            }
        }

        public async Task InvalidateMenuCacheAsync(string menuId)
        {
            try
            {
                // Invalidate all cache entries related to this menu
                await _cacheService.RemoveByPatternAsync($"menu:{menuId}");
                _logger.LogInformation("Invalidated cache for menu: {MenuId}", menuId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating menu cache: {MenuId}", menuId);
            }
        }

        public async Task InvalidateAllReviewCachesAsync()
        {
            try
            {
                // Invalidate all review-related caches
                await _cacheService.RemoveByPatternAsync("reviews:");
                await _cacheService.RemoveByPatternAsync("rating:");
                _logger.LogInformation("Invalidated all review caches");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating all review caches");
            }
        }
    }
}
