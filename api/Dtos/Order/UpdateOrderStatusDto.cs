using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Order
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
