using api.Models;

namespace api.Dtos.Order
{
    public class OrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
        public string Notes { get; set; } = string.Empty;
        public double Total { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentProofUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class OrderItemDto
    {
        public string MenuId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public double Price { get; set; }
        public int Quantity { get; set; }
        public string ImageURL { get; set; } = string.Empty;
    }
}
