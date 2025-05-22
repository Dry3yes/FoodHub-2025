namespace api.Dtos.Seller
{
    public class CreateSellerApplicationDto
    {
        public string StoreName { get; set; } = string.Empty;
        public string UserIdentificationNumber { get; set; } = string.Empty;
        public string? IdentificationUrl { get; set; }
        public string Description { get; set; } = string.Empty;
        public string DeliveryTimeEstimate { get; set; } = string.Empty;
    }
}