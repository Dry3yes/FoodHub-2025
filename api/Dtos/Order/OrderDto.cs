namespace api.Dtos.Order
{
    public class OrderDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public List<OrderItemDto> Items { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public double TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Note { get; set; }
    }

    public class OrderItemDto
    {
        public int MenuItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public double Price { get; set; }
        public double Subtotal { get; set; }
    }
}