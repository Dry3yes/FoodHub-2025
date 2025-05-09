namespace api.Dtos.Menu
{
    public class CreateMenuRequestDto
    {
        public string ItemName { get; set; } = string.Empty;
        public double Price { get; set; }
        public string? ImageURL { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}