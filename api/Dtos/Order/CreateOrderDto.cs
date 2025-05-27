using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Order
{
    public class CreateOrderDto
    {
        public string Notes { get; set; } = string.Empty;
    }
}
