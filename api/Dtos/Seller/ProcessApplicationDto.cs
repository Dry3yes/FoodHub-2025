using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Seller
{
    public class ProcessApplicationDto
    {
        public string Status { get; set; } = string.Empty; // "Approved" or "Rejected"
        public string? Message { get; set; }
    }
}