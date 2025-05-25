using api.Models;

namespace api.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(string userId);
        Task<Cart> CreateCartAsync(Cart cart);
        Task<Cart> UpdateCartAsync(Cart cart);
        Task<bool> DeleteCartAsync(string cartId);
        Task<Cart> AddItemToCartAsync(string userId, CartItem cartItem);
        Task<Cart> UpdateCartItemAsync(string userId, string menuId, int quantity);
        Task<Cart> RemoveItemFromCartAsync(string userId, string menuId);
        Task<Cart> ClearCartAsync(string userId);
    }
}
