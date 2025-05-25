using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Support
{
    public class UpdateTicketStatusDto
    {
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty; // open, in-progress, resolved, closed

        [StringLength(1000)]
        public string? AdminResponse { get; set; }
    }
}
