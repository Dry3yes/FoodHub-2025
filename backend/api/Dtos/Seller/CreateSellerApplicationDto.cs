using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Seller
{
    public class CreateSellerApplicationDto
    {
        public string StoreName { get; set; } = string.Empty;
        public string StoreDescription { get; set; } = string.Empty;
        public string IdentificationUrl { get; set; } = string.Empty;
    }
}