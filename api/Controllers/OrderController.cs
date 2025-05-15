using api.Dtos.Order;
using api.Interfaces;
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
        private readonly ILogger<OrderController> _logger;

        public OrderController(IOrderRepository orderRepository, ILogger<OrderController> logger)
        {
            _orderRepository = orderRepository;
            _logger = logger;
        }

        [HttpGet("orders/{orderId}/status")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderStatus(string orderId)
        {
            try
            {
                var order = await _orderRepository.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        orderId = order.OrderId,
                        status = order.Status,
                        updatedAt = order.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order status: {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error retrieving order status" });
            }
        }

        [HttpPut("orders/{orderId}/status")]
        [Authorize(Roles = "Admin,Seller")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] string status)
        {
            try
            {
                // Validate status
                var validStatuses = new[] { "Pending", "Processing", "Ready", "Completed", "Cancelled" };
                if (!validStatuses.Contains(status))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid status. Valid statuses are: " + string.Join(", ", validStatuses)
                    });
                }

                var result = await _orderRepository.UpdateOrderStatusAsync(orderId, status);
                if (!result)
                {
                    return NotFound(new { success = false, message = "Order not found" });
                }

                _logger.LogInformation("Order status updated: {OrderId} -> {Status}", orderId, status);
                return Ok(new { success = true, message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status: {OrderId}", orderId);
                return StatusCode(500, new { success = false, message = "Error updating order status" });
            }
        }

        [HttpGet("orders")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                IEnumerable<Models.Order> orders;
                if (userRole == "Admin" || userRole == "Seller")
                {
                    // Admins and Sellers can see all orders
                    orders = await _orderRepository.GetAllOrdersAsync();
                }
                else
                {
                    // Regular users can only see their own orders
                    if (string.IsNullOrEmpty(userId))
                    {
                        return Unauthorized(new { success = false, message = "User not authenticated" });
                    }
                    orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
                }

                var orderDtos = orders.Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    Items = o.Items.Select(i => new OrderItemDto
                    {
                        MenuItemId = i.MenuItemId,
                        ItemName = i.ItemName,
                        Quantity = i.Quantity,
                        Price = i.Price,
                        Subtotal = i.Subtotal
                    }).ToList(),
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Note = o.Note
                });

                return Ok(new { success = true, data = orderDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, new { success = false, message = "Error retrieving orders" });
            }
        }
    }
}