namespace api.Dtos.Menu
{
    public class CreateMenuRequestDto
    {
        public string ItemName { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? ImageURL { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsOutOfStock { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // SellerId and StoreName will be set by the controller based on the authenticated seller
    }
}