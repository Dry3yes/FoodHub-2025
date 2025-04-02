using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.Interfaces
{
    public interface IMenuRepository
    {
        Task<IEnumerable<Menu>> GetAllMenusAsync();
        Task<Menu?> GetMenuByIdAsync(int id);
        Task<Menu> CreateMenuAsync(Menu menu);
        Task<Menu> UpdateMenuAsync(Menu menu);
        Task<bool> DeleteMenuAsync(int id);
        Task<IEnumerable<Menu>> GetMenusByCategoryAsync(string category);
    }
}