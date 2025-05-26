using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Support
{
    public class CreateSupportTicketDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string UserType { get; set; } = string.Empty; // customer, seller, delivery

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty; // general, account, orders, etc.

        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;
    }
}
