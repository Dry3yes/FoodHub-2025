namespace api.Dtos.Cart
{
    public class CartDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public double Subtotal { get; set; }
        public double ShippingCost { get; set; }
        public double Total { get; set; }
    }

    public class CartItemDto
    {
        public string MenuId { get; set; } = string.Empty;
        public string MenuItemName { get; set; } = string.Empty;
        public double Price { get; set; }
        public int Quantity { get; set; }
        public string ImageURL { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public double ItemTotal => Price * Quantity;
    }
}
