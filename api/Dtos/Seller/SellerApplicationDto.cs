using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Seller
{
    public class SellerApplicationDto
    {
        public string ApplicationId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string StoreName { get; set; } = string.Empty;
        public string StoreDescription { get; set; } = string.Empty;
        public string IdentificationUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? AdminMessage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }
}