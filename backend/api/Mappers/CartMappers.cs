using api.Dtos.Cart;
using api.Models;

namespace api.Mappers
{
    public static class CartMappers
    {
        public static CartDto ToCartDto(this Cart cart)
        {
            var subtotal = cart.Items.Sum(item => item.Price * item.Quantity);
            var shippingCost = cart.Items.Count > 0 ? 5.0 : 0.0; // Fixed shipping cost

            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Items = cart.Items.Select(item => item.ToCartItemDto()).ToList(),
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                Total = subtotal + shippingCost
            };
        }

        public static CartItemDto ToCartItemDto(this CartItem cartItem)
        {
            return new CartItemDto
            {
                MenuId = cartItem.MenuId,
                MenuItemName = cartItem.MenuItemName,
                Price = cartItem.Price,
                Quantity = cartItem.Quantity,
                ImageURL = cartItem.ImageURL,
                SellerId = cartItem.SellerId,
                StoreName = cartItem.StoreName
            };
        }

        public static CartItem ToCartItemFromMenu(this Menu menu, int quantity)
        {
            return new CartItem
            {
                MenuId = menu.Id,
                MenuItemName = menu.ItemName,
                Price = menu.Price,
                Quantity = quantity,
                ImageURL = menu.ImageURL,
                SellerId = menu.SellerId,
                StoreName = menu.StoreName
            };
        }
    }
}
