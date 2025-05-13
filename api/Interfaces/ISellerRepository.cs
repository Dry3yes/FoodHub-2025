using api.Models;

namespace api.Interfaces
{
    public interface ISellerRepository
    {
        Task<Seller> CreateAsync(Seller seller);
        Task<SellerApplication> CreateApplicationAsync(SellerApplication seller);
        Task<SellerApplication?> GetApplicationByIdAsync(string id);
        Task<SellerApplication?> GetApplicationByUserIdAsync(string userId);
        Task<IEnumerable<SellerApplication>> GetAllApplicationsAsync(string status = "");
        Task<bool> UpdateApplicationAsync(SellerApplication seller);
        Task<bool> DeleteFieldAsync(string collection, string document, string field);
        Task<IEnumerable<Seller>> GetAllAsync();
        Task<IEnumerable<object>> GetStoreNamesAsync();
        Task<bool> UpdateSellerAsync(Seller seller);
        Task<object?> GetStoreByIdAsync(string sellerId);
        Task<Seller?> GetSellerByUserIdAsync(string userId);
    }
}