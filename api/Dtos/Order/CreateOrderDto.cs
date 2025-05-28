using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Order
{
    public class CreateOrderDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
