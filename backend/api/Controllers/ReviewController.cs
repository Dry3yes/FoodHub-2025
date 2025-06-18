using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using api.Interfaces;
using api.Models;
using api.Dtos.Review;
using api.Services;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICachedReviewService _cachedReviewService;
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(
            IReviewRepository reviewRepository,
            IOrderRepository orderRepository,
            IUserRepository userRepository,
            ICachedReviewService cachedReviewService,
            ILogger<ReviewController> logger)
        {
            _reviewRepository = reviewRepository;
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _cachedReviewService = cachedReviewService;
            _logger = logger;
        }
        [HttpPost]
        [Route("review")]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Validate if user can review this order
                if (!await _reviewRepository.CanUserReviewOrderAsync(createReviewDto.OrderId, userId))
                {
                    return BadRequest("You cannot review this order");
                }

                // Get order details
                var order = await _orderRepository.GetOrderByIdAsync(createReviewDto.OrderId);
                if (order == null)
                {
                    return NotFound("Order not found");
                }                // Get user details
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Create seller review
                var review = new Review
                {
                    UserId = userId,
                    UserName = user.Name,
                    OrderId = createReviewDto.OrderId,
                    SellerId = createReviewDto.SellerId,
                    StoreName = order.StoreName,
                    Rating = createReviewDto.Rating,
                    Comment = createReviewDto.Comment,
                    Tags = createReviewDto.Tags
                };

                var createdReview = await _reviewRepository.CreateReviewAsync(review);
                if (createdReview == null)
                {
                    return BadRequest("Failed to create review");
                }

                // Create menu item reviews
                var createdMenuItemReviews = new List<MenuItemReview>();
                foreach (var menuItemReviewDto in createReviewDto.MenuItemReviews)
                {
                    var menuItemReview = new MenuItemReview
                    {
                        UserId = userId,
                        UserName = user.Name,
                        OrderId = createReviewDto.OrderId,
                        MenuId = menuItemReviewDto.MenuId,
                        MenuItemName = menuItemReviewDto.MenuItemName,
                        SellerId = createReviewDto.SellerId,
                        Rating = menuItemReviewDto.Rating,
                        Comment = menuItemReviewDto.Comment,
                        Tags = menuItemReviewDto.Tags
                    }; var createdMenuItemReview = await _reviewRepository.CreateMenuItemReviewAsync(menuItemReview);
                    if (createdMenuItemReview != null)
                    {
                        createdMenuItemReviews.Add(createdMenuItemReview);
                        // Invalidate menu cache when new review is added
                        await _cachedReviewService.InvalidateMenuCacheAsync(menuItemReviewDto.MenuId);
                    }
                }

                // Invalidate seller cache when new review is added
                await _cachedReviewService.InvalidateSellerCacheAsync(createReviewDto.SellerId);

                return Ok(new
                {
                    Review = createdReview,
                    MenuItemReviews = createdMenuItemReviews,
                    Message = "Review created successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("review/order/{orderId}/status")]
        [Authorize]
        public async Task<IActionResult> GetOrderReviewStatus(string orderId)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var hasReviewed = await _reviewRepository.HasUserReviewedOrderAsync(orderId, userId);
                var canReview = await _reviewRepository.CanUserReviewOrderAsync(orderId, userId);

                var response = new OrderReviewStatusDto
                {
                    OrderId = orderId,
                    HasReviewed = hasReviewed,
                    CanReview = canReview
                }; if (hasReviewed)
                {
                    var existingReview = await _reviewRepository.GetReviewByOrderIdAsync(orderId, userId);
                    if (existingReview != null)
                    {
                        response.ExistingReview = new ReviewDto
                        {
                            Id = existingReview.Id,
                            UserId = existingReview.UserId,
                            UserName = existingReview.UserName,
                            OrderId = existingReview.OrderId,
                            SellerId = existingReview.SellerId,
                            StoreName = existingReview.StoreName,
                            Rating = existingReview.Rating,
                            Comment = existingReview.Comment,
                            Tags = existingReview.Tags,
                            CreatedAt = existingReview.CreatedAt,
                            CanEdit = true // User can edit their own review
                        };
                    }

                    var existingMenuItemReviews = await _reviewRepository.GetMenuItemReviewsByOrderIdAsync(orderId, userId);
                    response.ExistingMenuItemReviews = existingMenuItemReviews.Select(mir => new MenuItemReviewDto
                    {
                        Id = mir.Id,
                        UserId = mir.UserId,
                        UserName = mir.UserName,
                        OrderId = mir.OrderId,
                        MenuId = mir.MenuId,
                        MenuItemName = mir.MenuItemName,
                        Rating = mir.Rating,
                        Comment = mir.Comment,
                        Tags = mir.Tags,
                        CreatedAt = mir.CreatedAt,
                        CanEdit = true // User can edit their own review
                    }).ToList();
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order review status");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("review/seller/{sellerId}")]
        [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "limit", "offset" })] // 5 minutes cache
        public async Task<IActionResult> GetSellerReviews(string sellerId, [FromQuery] int limit = 10, [FromQuery] int offset = 0)
        {
            try
            {
                var reviews = await _cachedReviewService.GetReviewsBySellerIdAsync(sellerId, limit, offset);
                var sellerRating = await _cachedReviewService.GetSellerRatingAsync(sellerId); var response = new SellerRatingDto
                {
                    SellerId = sellerId,
                    AverageRating = sellerRating?.AverageRating ?? 0,
                    TotalReviews = sellerRating?.TotalReviews ?? 0,
                    RatingDistribution = sellerRating?.RatingDistribution ?? new Dictionary<string, int>(),
                    RecentReviews = reviews.Select(r => new ReviewDto
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserName = r.UserName,
                        OrderId = r.OrderId,
                        SellerId = r.SellerId,
                        StoreName = r.StoreName,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        Tags = r.Tags,
                        CreatedAt = r.CreatedAt,
                        CanEdit = false // Will be set to true if current user owns the review
                    }).ToList()
                };                // Set CanEdit for current user's reviews
                var currentUserId = await GetCurrentUserIdAsync();
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    foreach (var review in response.RecentReviews)
                    {
                        if (review.UserId == currentUserId)
                        {
                            review.CanEdit = true;
                        }
                    }
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting seller reviews");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("review/menu/{menuId}")]
        [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "limit", "offset" })] // 5 minutes cache
        public async Task<IActionResult> GetMenuItemReviews(string menuId, [FromQuery] int limit = 10, [FromQuery] int offset = 0)
        {
            try
            {
                var reviews = await _cachedReviewService.GetMenuItemReviewsByMenuIdAsync(menuId, limit, offset);
                var menuItemRating = await _cachedReviewService.GetMenuItemRatingAsync(menuId); var response = new MenuItemRatingDto
                {
                    MenuId = menuId,
                    AverageRating = menuItemRating?.AverageRating ?? 0,
                    TotalReviews = menuItemRating?.TotalReviews ?? 0,
                    RatingDistribution = menuItemRating?.RatingDistribution ?? new Dictionary<string, int>(),
                    RecentReviews = reviews.Select(r => new MenuItemReviewDto
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserName = r.UserName,
                        OrderId = r.OrderId,
                        MenuId = r.MenuId,
                        MenuItemName = r.MenuItemName,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        Tags = r.Tags,
                        CreatedAt = r.CreatedAt,
                        CanEdit = false
                    }).ToList()
                };                // Set CanEdit for current user's reviews
                var currentUserId = await GetCurrentUserIdAsync();
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    foreach (var review in response.RecentReviews)
                    {
                        if (review.UserId == currentUserId)
                        {
                            review.CanEdit = true;
                        }
                    }
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting menu item reviews");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("review/recent")]
        public async Task<IActionResult> GetRecentReviews([FromQuery] int limit = 10)
        {
            try
            {
                var reviews = await _reviewRepository.GetRecentReviewsAsync(limit);

                var response = reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.UserName,
                    OrderId = r.OrderId,
                    SellerId = r.SellerId,
                    StoreName = r.StoreName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    Tags = r.Tags,
                    CreatedAt = r.CreatedAt,
                    CanEdit = false
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent reviews");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpPut("review/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] CreateReviewDto updateReviewDto)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var existingReview = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (existingReview == null)
                {
                    return NotFound("Review not found");
                }

                if (existingReview.UserId != userId)
                {
                    return Forbid("You can only edit your own reviews");
                }

                // Update review
                existingReview.Rating = updateReviewDto.Rating;
                existingReview.Comment = updateReviewDto.Comment;
                existingReview.Tags = updateReviewDto.Tags;

                var updatedReview = await _reviewRepository.UpdateReviewAsync(reviewId, existingReview);

                return Ok(new
                {
                    Review = updatedReview,
                    Message = "Review updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpDelete("review/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var existingReview = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (existingReview == null)
                {
                    return NotFound("Review not found");
                }

                if (existingReview.UserId != userId)
                {
                    return Forbid("You can only delete your own reviews");
                }

                var success = await _reviewRepository.DeleteReviewAsync(reviewId);
                if (success)
                {
                    return Ok(new { Message = "Review deleted successfully" });
                }
                else
                {
                    return BadRequest("Failed to delete review");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review");
                return StatusCode(500, "Internal server error");
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
