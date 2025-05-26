using api.Dtos.Order;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMenuRepository _menuRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly ILogger<OrderController> _logger;

        public OrderController(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IUserRepository userRepository,
            IMenuRepository menuRepository,
            ISellerRepository sellerRepository,
            ILogger<OrderController> logger)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _userRepository = userRepository;
            _menuRepository = menuRepository;
            _sellerRepository = sellerRepository;
            _logger = logger;
        }

        [HttpPost]
        [Route("checkout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Checkout([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get the user's cart
                var cart = await _cartRepository.GetCartByUserIdAsync(userId);
                if (cart == null || !cart.Items.Any())
                {
                    return BadRequest(new { success = false, message = "Cart is empty" });
                }

                // Check stock availability for all items
                foreach (var cartItem in cart.Items)
                {
                    var menu = await _menuRepository.GetMenuByIdAsync(cartItem.MenuId);
                    if (menu == null)
                    {
                        return BadRequest(new { success = false, message = $"Menu item '{cartItem.MenuItemName}' not found" });
                    }

                    if (menu.Stock < cartItem.Quantity)
                    {
                        return BadRequest(new { success = false, message = $"Insufficient stock for '{cartItem.MenuItemName}'" });
                    }
                }

                // Create the order from the cart
                var order = cart.ToOrderFromCart(createOrderDto.Notes);
                var createdOrder = await _orderRepository.CreateOrderAsync(order);

                // Update stock for each menu item
                foreach (var orderItem in order.Items)
                {
                    var menu = await _menuRepository.GetMenuByIdAsync(orderItem.MenuId);
                    if (menu != null)
                    {
                        menu.Stock -= orderItem.Quantity;
                        await _menuRepository.UpdateMenuAsync(menu);
                    }
                }

                // Clear the cart after successful checkout
                await _cartRepository.ClearCartAsync(userId);

                // Return the created order
                var orderDto = createdOrder.ToOrderDto();
                _logger.LogInformation("Order created for user {UserId}: {OrderId}", userId, createdOrder.Id);

                return Ok(new
                {
                    success = true,
                    message = "Order created successfully",
                    data = orderDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { success = false, message = "Error creating order" });
            }
        }

        [HttpGet]
        [Route("orders")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserOrders()
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
                var orderDtos = orders.Select(o => o.ToOrderDto()).ToList();

                return Ok(new
                {
                    success = true,
                    data = new { orders = orderDtos }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user orders");
                return StatusCode(500, new { success = false, message = "Error retrieving orders" });
            }
        }

        [HttpGet]
        [Route("orders/{orderId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOrderById(string orderId)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                // Ensure user can only access their own orders or seller can access orders for their store
                if (order.UserId != userId)
                {
                    // Check if user is a seller and this order is for their store
                    var isSeller = User.HasClaim(c => c.Type == "role" && c.Value == "seller");
                    if (!isSeller || order.SellerId != await GetSellerIdForUserAsync())
                    {
                        return Unauthorized(new { success = false, message = "You are not authorized to view this order" });
                    }
                }

                var orderDto = order.ToOrderDto();
                return Ok(new
                {
                    success = true,
                    data = orderDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error retrieving order" });
            }
        }

        [HttpGet]
        [Route("seller/orders")]
        [Authorize(Policy = "RequireSellerRole")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetSellerOrders()
        {
            try
            {
                var sellerId = await GetSellerIdForUserAsync();
                if (string.IsNullOrEmpty(sellerId))
                {
                    return Unauthorized(new { success = false, message = "Seller not found" });
                }

                var orders = await _orderRepository.GetOrdersBySellerIdAsync(sellerId);
                var orderDtos = orders.Select(o => o.ToOrderDto()).ToList();

                return Ok(new
                {
                    success = true,
                    data = new { orders = orderDtos }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving seller orders");
                return StatusCode(500, new { success = false, message = "Error retrieving orders" });
            }
        }

        [HttpPut]
        [Route("seller/orders/{orderId}/status")]
        [Authorize(Policy = "RequireSellerRole")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] UpdateOrderStatusDto updateOrderStatusDto)
        {
            try
            {
                var sellerId = await GetSellerIdForUserAsync();
                if (string.IsNullOrEmpty(sellerId))
                {
                    return Unauthorized(new { success = false, message = "Seller not found" });
                }

                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                // Ensure seller can only update orders for their store
                if (order.SellerId != sellerId)
                {
                    return Unauthorized(new { success = false, message = "You are not authorized to update this order" });
                }

                // Parse and validate status
                if (!Enum.TryParse<OrderStatus>(updateOrderStatusDto.Status, true, out var status))
                {
                    return BadRequest(new { success = false, message = "Invalid order status" });
                }

                var updatedOrder = await _orderRepository.UpdateOrderStatusAsync(orderId, status);
                if (updatedOrder == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                var orderDto = updatedOrder.ToOrderDto();
                return Ok(new
                {
                    success = true,
                    message = "Order status updated successfully",
                    data = orderDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error updating order status" });
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

        private async Task<string?> GetSellerIdForUserAsync()
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return null;
                }

                // Get user ID first
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                if (user == null)
                {
                    return null;
                }

                // Get seller by user ID
                var seller = await _sellerRepository.GetSellerByUserIdAsync(user.UserId);
                return seller?.SellerId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller ID");
                return null;
            }
        }
    }
}
