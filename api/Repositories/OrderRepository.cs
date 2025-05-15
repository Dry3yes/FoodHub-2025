using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Caching.Memory;

namespace api.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly ILogger<OrderRepository> _logger;
        private readonly IMemoryCache _cache;
        private const string OrdersCacheKey = "AllOrders";
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);

        public OrderRepository(FirestoreDb firestoreDb, ILogger<OrderRepository> logger, IMemoryCache cache)
        {
            _firestoreDb = firestoreDb;
            _logger = logger;
            _cache = cache;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            try
            {
                order.OrderId = DateTime.UtcNow.Ticks.ToString() + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
                await _firestoreDb.Collection("Orders").Document(order.OrderId).SetAsync(order);
                _cache.Remove(OrdersCacheKey);
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                throw;
            }
        }

        public async Task<Order?> GetOrderByIdAsync(string orderId)
        {
            try
            {
                var orderRef = _firestoreDb.Collection("Orders").Document(orderId);
                var snapshot = await orderRef.GetSnapshotAsync();
                return snapshot.Exists ? snapshot.ConvertTo<Order>() : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order by ID: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(string userId)
        {
            try
            {
                var query = _firestoreDb.Collection("Orders").WhereEqualTo("UserId", userId);
                var snapshot = await query.GetSnapshotAsync();
                return snapshot.Documents.Select(d => d.ConvertTo<Order>()).OrderByDescending(o => o.CreatedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            try
            {
                if (_cache.TryGetValue<IEnumerable<Order>>(OrdersCacheKey, out var cachedOrders) && cachedOrders != null)
                {
                    return cachedOrders;
                }

                var snapshot = await _firestoreDb.Collection("Orders").GetSnapshotAsync();
                var orders = snapshot.Documents
                    .Select(d => d.ConvertTo<Order>())
                    .OrderByDescending(o => o.CreatedAt)
                    .ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(_cacheDuration)
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(OrdersCacheKey, orders, cacheOptions);
                return orders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all orders");
                throw;
            }
        }

        public async Task<bool> UpdateOrderStatusAsync(string orderId, string status)
        {
            try
            {
                var orderRef = _firestoreDb.Collection("Orders").Document(orderId);
                var snapshot = await orderRef.GetSnapshotAsync();
                
                if (!snapshot.Exists)
                {
                    return false;
                }

                await orderRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "Status", status },
                    { "UpdatedAt", DateTime.UtcNow }
                });

                _cache.Remove(OrdersCacheKey);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status: {OrderId}", orderId);
                throw;
            }
        }

        public async Task<Order> UpdateOrderAsync(Order order)
        {
            try
            {
                order.UpdatedAt = DateTime.UtcNow;
                await _firestoreDb.Collection("Orders").Document(order.OrderId).SetAsync(order);
                _cache.Remove(OrdersCacheKey);
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order: {OrderId}", order.OrderId);
                throw;
            }
        }
    }
}