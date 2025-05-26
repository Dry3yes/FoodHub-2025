using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Order
{
    public class CreateOrderDto
    {
        [Required]
        public string Notes { get; set; } = string.Empty;
    }
}
