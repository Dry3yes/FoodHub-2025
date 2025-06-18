using api.Interfaces;
using api.Models;
using api.Services;

namespace api.Services
{
    public interface ICachedMenuService
    {
        Task<IEnumerable<Menu>> GetAllMenusAsync();
        Task<Menu?> GetMenuByIdAsync(string menuId);
        Task<IEnumerable<Menu>> GetMenusByCategoryAsync(string category);
        Task<IEnumerable<Menu>> GetMenusBySellerIdAsync(string sellerId);
        Task<IEnumerable<Menu>> SearchMenusByNameAsync(string query);
        Task InvalidateAllMenusCacheAsync();
        Task InvalidateMenuCacheAsync(string menuId);
        Task InvalidateSellerMenusCacheAsync(string sellerId);
        Task InvalidateCategoryMenusCacheAsync(string category);
    }

    public class CachedMenuService : ICachedMenuService
    {
        private readonly IMenuRepository _menuRepository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedMenuService> _logger;

        // Cache key patterns
        private const string ALL_MENUS_KEY = "menus:all";
        private const string MENU_BY_ID_KEY = "menu:id:{0}";
        private const string MENUS_BY_CATEGORY_KEY = "menus:category:{0}";
        private const string MENUS_BY_SELLER_KEY = "menus:seller:{0}";
        private const string MENUS_SEARCH_KEY = "menus:search:{0}";

        public CachedMenuService(
            IMenuRepository menuRepository,
            ICacheService cacheService,
            ILogger<CachedMenuService> logger)
        {
            _menuRepository = menuRepository;
            _cacheService = cacheService;
            _logger = logger;
        }
        public async Task<IEnumerable<Menu>> GetAllMenusAsync()
        {
            var cacheKey = ALL_MENUS_KEY;

            var cached = await _cacheService.GetAsync<List<Menu>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for all menus");
                return cached;
            }

            _logger.LogDebug("Cache miss for all menus, fetching from database");
            var menus = await _menuRepository.GetAllMenusAsync();
            var menusList = menus.ToList();

            // Cache all menus for 10 minutes
            await _cacheService.SetAsync(cacheKey, menusList, TimeSpan.FromMinutes(10));

            return menusList;
        }

        public async Task<Menu?> GetMenuByIdAsync(string menuId)
        {
            var cacheKey = string.Format(MENU_BY_ID_KEY, menuId);

            var cached = await _cacheService.GetAsync<Menu>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menu: {MenuId}", menuId);
                return cached;
            }

            _logger.LogDebug("Cache miss for menu: {MenuId}, fetching from database", menuId);
            var menu = await _menuRepository.GetMenuByIdAsync(menuId);

            if (menu != null)
            {
                // Cache individual menus for 15 minutes
                await _cacheService.SetAsync(cacheKey, menu, TimeSpan.FromMinutes(15));
            }

            return menu;
        }
        public async Task<IEnumerable<Menu>> GetMenusByCategoryAsync(string category)
        {
            var cacheKey = string.Format(MENUS_BY_CATEGORY_KEY, category);

            var cached = await _cacheService.GetAsync<List<Menu>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menus by category: {Category}", category);
                return cached;
            }

            _logger.LogDebug("Cache miss for menus by category: {Category}, fetching from database", category);
            var menus = await _menuRepository.GetMenusByCategoryAsync(category);
            var menusList = menus.ToList();

            // Cache category menus for 10 minutes
            await _cacheService.SetAsync(cacheKey, menusList, TimeSpan.FromMinutes(10));

            return menusList;
        }

        public async Task<IEnumerable<Menu>> GetMenusBySellerIdAsync(string sellerId)
        {
            var cacheKey = string.Format(MENUS_BY_SELLER_KEY, sellerId);

            var cached = await _cacheService.GetAsync<List<Menu>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menus by seller: {SellerId}", sellerId);
                return cached;
            }

            _logger.LogDebug("Cache miss for menus by seller: {SellerId}, fetching from database", sellerId);
            var menus = await _menuRepository.GetMenusBySellerIdAsync(sellerId);
            var menusList = menus.ToList();

            // Cache seller menus for 8 minutes (they might change more frequently)
            await _cacheService.SetAsync(cacheKey, menusList, TimeSpan.FromMinutes(8));

            return menusList;
        }

        public async Task<IEnumerable<Menu>> SearchMenusByNameAsync(string query)
        {
            // Normalize the query for consistent caching
            var normalizedQuery = query.Trim().ToLowerInvariant();
            var cacheKey = string.Format(MENUS_SEARCH_KEY, normalizedQuery);

            var cached = await _cacheService.GetAsync<List<Menu>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for menu search: {Query}", query);
                return cached;
            }

            _logger.LogDebug("Cache miss for menu search: {Query}, fetching from database", query);
            var menus = await _menuRepository.SearchMenusByNameAsync(query);
            var menusList = menus.ToList();

            // Cache search results for 5 minutes (searches are more dynamic)
            await _cacheService.SetAsync(cacheKey, menusList, TimeSpan.FromMinutes(5));

            return menusList;
        }

        public async Task InvalidateAllMenusCacheAsync()
        {
            try
            {
                // Invalidate all menu-related caches
                await _cacheService.RemoveByPatternAsync("menus:");
                await _cacheService.RemoveByPatternAsync("menu:");
                _logger.LogInformation("Invalidated all menus cache");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating all menus cache");
            }
        }

        public async Task InvalidateMenuCacheAsync(string menuId)
        {
            try
            {
                // Invalidate specific menu cache and related caches
                await _cacheService.RemoveAsync(string.Format(MENU_BY_ID_KEY, menuId));
                await _cacheService.RemoveAsync(ALL_MENUS_KEY);
                // Also invalidate search caches since menu content might have changed
                await _cacheService.RemoveByPatternAsync("menus:search:");
                _logger.LogInformation("Invalidated cache for menu: {MenuId}", menuId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating menu cache: {MenuId}", menuId);
            }
        }

        public async Task InvalidateSellerMenusCacheAsync(string sellerId)
        {
            try
            {
                // Invalidate seller-specific menu caches
                await _cacheService.RemoveAsync(string.Format(MENUS_BY_SELLER_KEY, sellerId));
                await _cacheService.RemoveAsync(ALL_MENUS_KEY);
                await _cacheService.RemoveByPatternAsync("menus:search:");
                _logger.LogInformation("Invalidated cache for seller menus: {SellerId}", sellerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating seller menus cache: {SellerId}", sellerId);
            }
        }

        public async Task InvalidateCategoryMenusCacheAsync(string category)
        {
            try
            {
                // Invalidate category-specific caches
                await _cacheService.RemoveAsync(string.Format(MENUS_BY_CATEGORY_KEY, category));
                _logger.LogInformation("Invalidated cache for category menus: {Category}", category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating category menus cache: {Category}", category);
            }
        }
    }
}
