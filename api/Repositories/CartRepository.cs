using api.Interfaces;
using api.Models;
using Google.Cloud.Firestore;

namespace api.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly FirestoreDb _firestoreDb;

        public CartRepository(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }

        public async Task<Cart?> GetCartByUserIdAsync(string userId)
        {
            var query = _firestoreDb.Collection("Carts").WhereEqualTo("UserId", userId);
            var snapshot = await query.GetSnapshotAsync();

            if (snapshot.Documents.Count > 0)
            {
                return snapshot.Documents.First().ConvertTo<Cart>();
            }

            return null;
        }

        public async Task<Cart> CreateCartAsync(Cart cart)
        {
            cart.Id = Guid.NewGuid().ToString();
            cart.CreatedAt = DateTime.UtcNow;
            cart.UpdatedAt = DateTime.UtcNow;

            var cartRef = _firestoreDb.Collection("Carts").Document(cart.Id);
            await cartRef.SetAsync(cart);
            return cart;
        }

        public async Task<Cart> UpdateCartAsync(Cart cart)
        {
            cart.UpdatedAt = DateTime.UtcNow;
            var cartRef = _firestoreDb.Collection("Carts").Document(cart.Id);
            await cartRef.SetAsync(cart);
            return cart;
        }

        public async Task<bool> DeleteCartAsync(string cartId)
        {
            var cartRef = _firestoreDb.Collection("Carts").Document(cartId);
            await cartRef.DeleteAsync();
            return true;
        }

        public async Task<Cart> AddItemToCartAsync(string userId, CartItem cartItem)
        {
            var cart = await GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                // Create new cart if it doesn't exist
                cart = new Cart
                {
                    UserId = userId,
                    Items = new List<CartItem> { cartItem }
                };
                return await CreateCartAsync(cart);
            }

            // Check if item already exists in cart
            var existingItem = cart.Items.FirstOrDefault(item => item.MenuId == cartItem.MenuId);

            if (existingItem != null)
            {
                // Update quantity if item exists
                existingItem.Quantity += cartItem.Quantity;
            }
            else
            {
                // Add new item to cart
                cart.Items.Add(cartItem);
            }

            return await UpdateCartAsync(cart);
        }

        public async Task<Cart> UpdateCartItemAsync(string userId, string menuId, int quantity)
        {
            var cart = await GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                throw new InvalidOperationException("Cart not found for user");
            }

            var existingItem = cart.Items.FirstOrDefault(item => item.MenuId == menuId);

            if (existingItem == null)
            {
                throw new InvalidOperationException("Item not found in cart");
            }

            existingItem.Quantity = quantity;
            return await UpdateCartAsync(cart);
        }

        public async Task<Cart> RemoveItemFromCartAsync(string userId, string menuId)
        {
            var cart = await GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                throw new InvalidOperationException("Cart not found for user");
            }

            cart.Items.RemoveAll(item => item.MenuId == menuId);
            return await UpdateCartAsync(cart);
        }

        public async Task<Cart> ClearCartAsync(string userId)
        {
            var cart = await GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                throw new InvalidOperationException("Cart not found for user");
            }

            cart.Items.Clear();
            return await UpdateCartAsync(cart);
        }
    }
}
