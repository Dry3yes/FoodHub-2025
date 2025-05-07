using api.Models;

namespace api.Interfaces
{
    public interface ISellerApplicationRepository
    {
        Task<SellerApplication> CreateApplicationAsync(SellerApplication application);
        Task<SellerApplication?> GetApplicationByIdAsync(string id);
        Task<SellerApplication?> GetApplicationByUserIdAsync(string userId);
        Task<IEnumerable<SellerApplication>> GetAllApplicationsAsync(string status = "");
        Task<bool> UpdateApplicationAsync(SellerApplication application);
    }
}