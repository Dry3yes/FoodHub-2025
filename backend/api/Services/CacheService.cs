using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace api.Services
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key) where T : class;
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;
        Task RemoveAsync(string key);
        Task RemoveByPatternAsync(string pattern);
        void Remove(string key);
        void RemoveByPattern(string pattern);
    }

    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<MemoryCacheService> _logger;
        private readonly HashSet<string> _cacheKeys;
        private readonly object _lock = new();

        public MemoryCacheService(IMemoryCache cache, ILogger<MemoryCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
            _cacheKeys = new HashSet<string>();
        }

        public Task<T?> GetAsync<T>(string key) where T : class
        {
            try
            {
                if (_cache.TryGetValue(key, out var cached))
                {
                    _logger.LogDebug("Cache hit for key: {Key}", key);
                    return Task.FromResult(cached as T);
                }

                _logger.LogDebug("Cache miss for key: {Key}", key);
                return Task.FromResult<T?>(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache value for key: {Key}", key);
                return Task.FromResult<T?>(null);
            }
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class
        {
            try
            {
                var options = new MemoryCacheEntryOptions();

                if (expiration.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = expiration.Value;
                }
                else
                {
                    // Default cache expiration for reviews: 5 minutes
                    options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
                }

                // Set priority based on data type
                if (key.Contains("review"))
                {
                    options.Priority = CacheItemPriority.High;
                    options.SlidingExpiration = TimeSpan.FromMinutes(2);
                }
                else
                {
                    options.Priority = CacheItemPriority.Normal;
                }

                _cache.Set(key, value, options);

                lock (_lock)
                {
                    _cacheKeys.Add(key);
                }

                _logger.LogDebug("Cache set for key: {Key}, expiration: {Expiration}", key, expiration);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache value for key: {Key}", key);
                return Task.CompletedTask;
            }
        }

        public Task RemoveAsync(string key)
        {
            Remove(key);
            return Task.CompletedTask;
        }

        public void Remove(string key)
        {
            try
            {
                _cache.Remove(key);

                lock (_lock)
                {
                    _cacheKeys.Remove(key);
                }

                _logger.LogDebug("Cache removed for key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache value for key: {Key}", key);
            }
        }

        public Task RemoveByPatternAsync(string pattern)
        {
            RemoveByPattern(pattern);
            return Task.CompletedTask;
        }

        public void RemoveByPattern(string pattern)
        {
            try
            {
                List<string> keysToRemove;

                lock (_lock)
                {
                    keysToRemove = _cacheKeys
                        .Where(key => key.Contains(pattern, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                foreach (var key in keysToRemove)
                {
                    Remove(key);
                }

                _logger.LogDebug("Cache cleared for pattern: {Pattern}, {Count} keys removed", pattern, keysToRemove.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache values by pattern: {Pattern}", pattern);
            }
        }
    }
}
