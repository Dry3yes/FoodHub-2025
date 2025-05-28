using api.Dtos.Order;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using api.Hubs;
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
        private readonly IImageService _imageService;
        private readonly ILogger<OrderController> _logger;
        private readonly IHubContext<ChatHub> _hubContext;

        public OrderController(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IUserRepository userRepository,
            IMenuRepository menuRepository,
            ISellerRepository sellerRepository,
            IImageService imageService,
            ILogger<OrderController> logger,
            IHubContext<ChatHub> hubContext)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _userRepository = userRepository;
            _menuRepository = menuRepository;
            _sellerRepository = sellerRepository;
            _imageService = imageService;
            _logger = logger;
            _hubContext = hubContext;
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
                var order = cart.ToOrderFromCart(createOrderDto.Notes, createOrderDto.Name, createOrderDto.Phone);
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
        [Authorize(Roles = "Seller")]
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
        [Authorize(Roles = "Seller")]
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

                // Send real-time notifications to the customer and seller
                await NotifyOrderStatusUpdate(updatedOrder, status);

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

        [HttpPost]
        [Route("upload-payment-proof")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UploadPaymentProof([FromForm] string orderId, IFormFile paymentProof)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (userId == null)
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Validate required parameters
                if (string.IsNullOrEmpty(orderId))
                {
                    return BadRequest(new { success = false, message = "Order ID is required" });
                }

                if (paymentProof == null || paymentProof.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Payment proof file is required" });
                }

                // Get the order to verify ownership
                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                // Ensure user can only upload payment proof for their own orders
                if (order.UserId != userId)
                {
                    return Unauthorized(new { success = false, message = "You are not authorized to upload payment proof for this order" });
                }

                // Validate file type and size
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg" };
                if (!allowedTypes.Contains(paymentProof.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Only JPEG and PNG images are allowed" });
                }

                if (paymentProof.Length > 5 * 1024 * 1024) // 5MB limit
                {
                    return BadRequest(new { success = false, message = "File size must be less than 5MB" });
                }

                // Upload the payment proof to Cloudflare R2
                var paymentProofUrl = await _imageService.UploadImageAsync(paymentProof);

                // Update the order with the payment proof URL
                var updatedOrder = await _orderRepository.UpdateOrderPaymentProofAsync(orderId, paymentProofUrl);
                if (updatedOrder == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                _logger.LogInformation("Payment proof uploaded for order {OrderId} by user {UserId}", orderId, userId); return Ok(new
                {
                    success = true,
                    message = "Payment proof uploaded successfully. Your order will be processed once payment is verified.",
                    data = new { orderId = orderId, paymentProofUrl = paymentProofUrl }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading payment proof for order {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error uploading payment proof" });
            }
        }

        [HttpPost]
        [Route("orders/{orderId}/confirm-pickup")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ConfirmPickup(string orderId)
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

                // Ensure user can only confirm pickup for their own orders
                if (order.UserId != userId)
                {
                    return Unauthorized(new { success = false, message = "You are not authorized to confirm pickup for this order" });
                }

                // Check if order is ready for pickup
                if (order.Status != OrderStatus.Ready)
                {
                    return BadRequest(new { success = false, message = "Order is not ready for pickup" });
                }
                var updatedOrder = await _orderRepository.UpdateOrderStatusAsync(orderId, OrderStatus.Completed);
                if (updatedOrder == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                // Send pickup confirmation notifications
                await NotifyOrderStatusUpdate(updatedOrder, OrderStatus.Completed);

                _logger.LogInformation("Order {OrderId} pickup confirmed by user {UserId}", orderId, userId);

                return Ok(new
                {
                    success = true,
                    message = "Order pickup confirmed successfully",
                    data = updatedOrder.ToOrderDto()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming pickup for order {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error confirming pickup" });
            }
        }

        [HttpGet]
        [Route("seller/orders/pending")]
        [Authorize(Roles = "Seller")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetPendingOrders()
        {
            try
            {
                var sellerId = await GetSellerIdForUserAsync();
                if (string.IsNullOrEmpty(sellerId))
                {
                    return Unauthorized(new { success = false, message = "Seller not found" });
                }

                var orders = await _orderRepository.GetOrdersBySellerIdAsync(sellerId);
                var pendingOrders = orders.Where(o => o.Status == OrderStatus.Pending && !string.IsNullOrEmpty(o.PaymentProofUrl)).ToList();
                var orderDtos = pendingOrders.Select(o => o.ToOrderDto()).ToList();

                return Ok(new
                {
                    success = true,
                    data = new { orders = orderDtos, count = orderDtos.Count }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending orders");
                return StatusCode(500, new { success = false, message = "Error retrieving pending orders" });
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

        private async Task NotifyOrderStatusUpdate(Order order, OrderStatus newStatus)
        {
            try
            {
                var orderDto = order.ToOrderDto();

                // Prepare notification message based on status
                string notificationMessage = newStatus switch
                {
                    OrderStatus.Confirmed => "Pesanan Anda telah dikonfirmasi dan akan segera dimasak",
                    OrderStatus.Preparing => "Pesanan Anda sedang dimasak",
                    OrderStatus.Ready => "Pesanan Anda sudah siap untuk diambil!",
                    OrderStatus.Completed => "Pesanan telah selesai. Terima kasih!",
                    OrderStatus.Cancelled => "Pesanan telah dibatalkan",
                    _ => "Status pesanan telah diperbarui"
                };

                // Notify the customer about order status update
                if (!string.IsNullOrEmpty(order.UserId))
                {
                    await _hubContext.Clients.User(order.UserId).SendAsync("OrderStatusUpdated", new
                    {
                        orderId = order.Id,
                        status = newStatus.ToString(),
                        message = notificationMessage,
                        orderData = orderDto
                    });
                }

                // Notify all sellers about order updates for their orders dashboard
                if (!string.IsNullOrEmpty(order.SellerId))
                {
                    await _hubContext.Clients.User(order.SellerId).SendAsync("SellerOrderUpdated", new
                    {
                        orderId = order.Id,
                        status = newStatus.ToString(),
                        orderData = orderDto
                    });
                }

                // For "Ready" status, send special pickup notification
                if (newStatus == OrderStatus.Ready)
                {
                    await _hubContext.Clients.User(order.UserId).SendAsync("OrderReadyForPickup", new
                    {
                        orderId = order.Id,
                        message = "🎉 Pesanan Anda sudah siap untuk diambil!",
                        orderData = orderDto,
                        timeout = 900 // 15 minutes in seconds
                    });
                }

                _logger.LogInformation("Order status notification sent for order {OrderId}, status: {Status}", order.Id, newStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending order status notification for order {OrderId}", order.Id);
            }
        }
    }
}
