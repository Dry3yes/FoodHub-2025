using api.Interfaces;
using api.Models;
using api.Services;

namespace api.Services
{
    public interface ICachedSellerService
    {
        Task<IEnumerable<object>> GetStoreNamesAsync();
        Task<object?> GetStoreByIdAsync(string sellerId);
        Task InvalidateStoresCacheAsync();
        Task InvalidateStoreCacheAsync(string sellerId);
    }

    public class CachedSellerService : ICachedSellerService
    {
        private readonly ISellerRepository _sellerRepository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedSellerService> _logger;

        // Cache key patterns
        private const string ALL_STORES_KEY = "stores:all";
        private const string STORE_BY_ID_KEY = "store:id:{0}";

        public CachedSellerService(
            ISellerRepository sellerRepository,
            ICacheService cacheService,
            ILogger<CachedSellerService> logger)
        {
            _sellerRepository = sellerRepository;
            _cacheService = cacheService;
            _logger = logger;
        }
        public async Task<IEnumerable<object>> GetStoreNamesAsync()
        {
            var cacheKey = ALL_STORES_KEY;

            var cached = await _cacheService.GetAsync<List<object>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for all stores");
                return cached;
            }

            _logger.LogDebug("Cache miss for all stores, fetching from database");
            var stores = await _sellerRepository.GetStoreNamesAsync();
            var storesList = stores.ToList();

            // Cache stores for 15 minutes since they don't change frequently
            await _cacheService.SetAsync(cacheKey, storesList, TimeSpan.FromMinutes(15));

            return storesList;
        }

        public async Task<object?> GetStoreByIdAsync(string sellerId)
        {
            var cacheKey = string.Format(STORE_BY_ID_KEY, sellerId);

            var cached = await _cacheService.GetAsync<object>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for store: {SellerId}", sellerId);
                return cached;
            }

            _logger.LogDebug("Cache miss for store: {SellerId}, fetching from database", sellerId);
            var store = await _sellerRepository.GetStoreByIdAsync(sellerId);

            if (store != null)
            {
                // Cache individual stores for 10 minutes
                await _cacheService.SetAsync(cacheKey, store, TimeSpan.FromMinutes(10));
            }

            return store;
        }

        public async Task InvalidateStoresCacheAsync()
        {
            try
            {
                // Invalidate all store-related caches
                await _cacheService.RemoveByPatternAsync("stores:");
                await _cacheService.RemoveByPatternAsync("store:");
                _logger.LogInformation("Invalidated all stores cache");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating stores cache");
            }
        }

        public async Task InvalidateStoreCacheAsync(string sellerId)
        {
            try
            {
                // Invalidate specific store cache and all stores list
                await _cacheService.RemoveAsync(string.Format(STORE_BY_ID_KEY, sellerId));
                await _cacheService.RemoveAsync(ALL_STORES_KEY);
                _logger.LogInformation("Invalidated cache for store: {SellerId}", sellerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating store cache: {SellerId}", sellerId);
            }
        }
    }
}
