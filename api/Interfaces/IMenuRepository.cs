using api.Models;

namespace api.Interfaces
{
    public interface IMenuRepository
    {
        Task<IEnumerable<Menu>> GetAllMenusAsync();
        Task<Menu?> GetMenuByIdAsync(string id);
        Task<Menu> CreateMenuAsync(Menu menu);
        Task<Menu> UpdateMenuAsync(Menu menu);
        Task<bool> DeleteMenuAsync(string id);
        Task<IEnumerable<Menu>> GetMenusByCategoryAsync(string category);
        Task<IEnumerable<Menu>> GetMenusBySellerIdAsync(string sellerId);
        Task<IEnumerable<Menu>> SearchMenusByNameAsync(string query);
    }
}