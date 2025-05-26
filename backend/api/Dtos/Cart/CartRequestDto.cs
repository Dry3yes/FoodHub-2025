using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Cart
{
    public class AddToCartRequestDto
    {
        [Required]
        public string MenuId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemRequestDto
    {
        [Required]
        public string MenuId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class RemoveFromCartRequestDto
    {
        [Required]
        public string MenuId { get; set; } = string.Empty;
    }
}
