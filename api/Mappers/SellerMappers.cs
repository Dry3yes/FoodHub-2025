using System.Security.Cryptography;
using System.Text;
using api.Models;

namespace api.Mappers
{
    public static class SellerMappers
    {
        public static SellerApplication ToSeller(this SellerApplication seller)
        {
            return new SellerApplication
            {
                StoreName = seller.StoreName,
                UserIdentificationNumber = seller.UserIdentificationNumber,
                IdentificationUrl = seller.IdentificationUrl
            };
        }

        public static string HashIdentificationNumber(string identificationNumber)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(identificationNumber));
            return Convert.ToBase64String(hashedBytes);
        }

        public static Seller ToFirestoreDto(this SellerApplication seller)
        {
            return new Seller
            {
                SellerId = seller.SellerId,
                UserId = seller.UserId,
                StoreName = seller.StoreName,
                UserIdentificationNumber = seller.UserIdentificationNumber,
                Status = seller.Status,
                CreatedAt = seller.CreatedAt
            };
        }
    }
}