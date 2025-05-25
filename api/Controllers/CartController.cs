using api.Dtos.Cart;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    [Authorize] // All cart operations require authentication
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMenuRepository _menuRepository;
        private readonly ILogger<CartController> _logger;

        public CartController(
            ICartRepository cartRepository,
            IUserRepository userRepository,
            IMenuRepository menuRepository,
            ILogger<CartController> logger)
        {
            _cartRepository = cartRepository;
            _userRepository = userRepository;
            _menuRepository = menuRepository;
            _logger = logger;
        }

        [HttpGet]
        [Route("cart")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var cart = await _cartRepository.GetCartByUserIdAsync(userId);

                if (cart == null)
                {
                    // Return empty cart if none exists
                    return Ok(new
                    {
                        success = true,
                        data = new CartDto
                        {
                            UserId = userId,
                            Items = new List<CartItemDto>(),
                            Subtotal = 0,
                            ShippingCost = 0,
                            Total = 0
                        }
                    });
                }

                var cartDto = cart.ToCartDto();
                return Ok(new { success = true, data = cartDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cart");
                return StatusCode(500, new { success = false, message = "Error retrieving cart" });
            }
        }

        [HttpPost]
        [Route("cart/add")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequestDto request)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get menu item details
                var menu = await _menuRepository.GetMenuByIdAsync(request.MenuId);
                if (menu == null)
                {
                    return NotFound(new { success = false, message = "Menu item not found" });
                }

                // Check if sufficient stock is available
                if (menu.Stock < request.Quantity)
                {
                    return BadRequest(new { success = false, message = "Insufficient stock available" });
                }

                // Create cart item from menu
                var cartItem = menu.ToCartItemFromMenu(request.Quantity);

                // Add item to cart
                var updatedCart = await _cartRepository.AddItemToCartAsync(userId, cartItem);
                var cartDto = updatedCart.ToCartDto();

                _logger.LogInformation("Item added to cart for user {UserId}: {MenuId} x{Quantity}", userId, request.MenuId, request.Quantity);

                return Ok(new
                {
                    success = true,
                    message = "Item added to cart successfully",
                    data = cartDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, new { success = false, message = "Error adding item to cart" });
            }
        }

        [HttpPut]
        [Route("cart/update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemRequestDto request)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get menu item to check stock
                var menu = await _menuRepository.GetMenuByIdAsync(request.MenuId);
                if (menu == null)
                {
                    return NotFound(new { success = false, message = "Menu item not found" });
                }

                // Check if sufficient stock is available
                if (menu.Stock < request.Quantity)
                {
                    return BadRequest(new { success = false, message = "Insufficient stock available" });
                }

                var updatedCart = await _cartRepository.UpdateCartItemAsync(userId, request.MenuId, request.Quantity);
                var cartDto = updatedCart.ToCartDto();

                _logger.LogInformation("Cart item updated for user {UserId}: {MenuId} quantity to {Quantity}", userId, request.MenuId, request.Quantity);

                return Ok(new
                {
                    success = true,
                    message = "Cart item updated successfully",
                    data = cartDto
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item");
                return StatusCode(500, new { success = false, message = "Error updating cart item" });
            }
        }

        [HttpDelete]
        [Route("cart/remove")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RemoveFromCart([FromBody] RemoveFromCartRequestDto request)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var updatedCart = await _cartRepository.RemoveItemFromCartAsync(userId, request.MenuId);
                var cartDto = updatedCart.ToCartDto();

                _logger.LogInformation("Item removed from cart for user {UserId}: {MenuId}", userId, request.MenuId);

                return Ok(new
                {
                    success = true,
                    message = "Item removed from cart successfully",
                    data = cartDto
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart");
                return StatusCode(500, new { success = false, message = "Error removing item from cart" });
            }
        }

        [HttpDelete]
        [Route("cart/clear")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var updatedCart = await _cartRepository.ClearCartAsync(userId);
                var cartDto = updatedCart.ToCartDto();

                _logger.LogInformation("Cart cleared for user {UserId}", userId);

                return Ok(new
                {
                    success = true,
                    message = "Cart cleared successfully",
                    data = cartDto
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, new { success = false, message = "Error clearing cart" });
            }
        }

        private async Task<string?> GetCurrentUserIdAsync()
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return null;
                }

                // Get the user information based on the Firebase UID
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);

                return user?.UserId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user ID");
                return null;
            }
        }
    }
}
