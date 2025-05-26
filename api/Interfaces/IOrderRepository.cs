using api.Models;

namespace api.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order?> GetOrderByIdAsync(string orderId);
        Task<List<Order>> GetOrdersByUserIdAsync(string userId);
        Task<List<Order>> GetOrdersBySellerIdAsync(string sellerId);
        Task<Order> CreateOrderAsync(Order order);
        Task<Order?> UpdateOrderStatusAsync(string orderId, OrderStatus status);
        Task<bool> DeleteOrderAsync(string orderId);
    }
}
