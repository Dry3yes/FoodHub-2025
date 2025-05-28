using api.Dtos.Order;
using api.Models;

namespace api.Mappers
{
    public static class OrderMappers
    {
        public static OrderDto ToOrderDto(this Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                SellerId = order.SellerId,
                StoreName = order.StoreName,
                Items = order.Items.Select(item => new OrderItemDto
                {
                    MenuId = item.MenuId,
                    MenuItemName = item.MenuItemName,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    ImageURL = item.ImageURL
                }).ToList(),
                Notes = order.Notes,
                Total = order.Total,
                Status = order.Status.ToString(),
                PaymentProofUrl = order.PaymentProofUrl,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            };
        }

        public static Order ToOrderFromCart(this Cart cart, string notes)
        {
            return new Order
            {
                UserId = cart.UserId,
                SellerId = cart.Items.FirstOrDefault()?.SellerId ?? string.Empty,
                StoreName = cart.Items.FirstOrDefault()?.StoreName ?? string.Empty,
                Items = cart.Items.Select(item => new OrderItem
                {
                    MenuId = item.MenuId,
                    MenuItemName = item.MenuItemName,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    ImageURL = item.ImageURL
                }).ToList(),
                Notes = notes,
                Total = cart.Items.Sum(item => item.Price * item.Quantity),
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }
}
