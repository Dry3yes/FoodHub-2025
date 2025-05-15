using api.Dtos.Review;
using api.Interfaces;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(
            IReviewRepository reviewRepository,
            IOrderRepository orderRepository,
            ILogger<ReviewController> logger)
        {
            _reviewRepository = reviewRepository;
            _orderRepository = orderRepository;
            _logger = logger;
        }

        [HttpPost("reviews")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Validate rating
                if (dto.Rating < 1 || dto.Rating > 5)
                {
                    return BadRequest(new { success = false, message = "Rating must be between 1 and 5" });
                }

                // Check if user has already reviewed this order
                if (await _reviewRepository.HasUserReviewedOrder(userId, dto.OrderId))
                {
                    return BadRequest(new { success = false, message = "You have already reviewed this order" });
                }

                // Verify that the user has actually ordered this item
                var order = await _orderRepository.GetOrderByIdAsync(dto.OrderId);
                var isVerifiedPurchase = order != null && 
                                       order.UserId == userId && 
                                       order.Items.Any(i => i.MenuItemId == dto.MenuItemId);

                if (!isVerifiedPurchase)
                {
                    return BadRequest(new { success = false, message = "You can only review items you have purchased" });
                }

                var review = new Review
                {
                    UserId = userId,
                    MenuItemId = dto.MenuItemId,
                    OrderId = dto.OrderId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow,
                    IsVerifiedPurchase = true
                };

                var createdReview = await _reviewRepository.CreateReviewAsync(review);

                return StatusCode(201, new
                {
                    success = true,
                    message = "Review created successfully",
                    data = new ReviewDto
                    {
                        ReviewId = createdReview.ReviewId,
                        UserId = createdReview.UserId,
                        MenuItemId = createdReview.MenuItemId,
                        OrderId = createdReview.OrderId,
                        Rating = createdReview.Rating,
                        Comment = createdReview.Comment,
                        CreatedAt = createdReview.CreatedAt,
                        UpdatedAt = createdReview.UpdatedAt,
                        IsVerifiedPurchase = createdReview.IsVerifiedPurchase
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { success = false, message = "Error creating review" });
            }
        }

        [HttpGet("menu-items/{menuItemId}/reviews")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetReviewsByMenuItem(int menuItemId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var reviews = await _reviewRepository.GetReviewsByMenuItemIdAsync(menuItemId);
                var averageRating = await _reviewRepository.GetAverageRatingForMenuItemAsync(menuItemId);

                var pagedReviews = reviews
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ReviewDto
                    {
                        ReviewId = r.ReviewId,
                        UserId = r.UserId,
                        MenuItemId = r.MenuItemId,
                        OrderId = r.OrderId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt,
                        IsVerifiedPurchase = r.IsVerifiedPurchase
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        reviews = pagedReviews,
                        averageRating = averageRating,
                        totalReviews = reviews.Count(),
                        pagination = new
                        {
                            currentPage = page,
                            pageSize = pageSize,
                            totalPages = (int)Math.Ceiling(reviews.Count() / (double)pageSize)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for menu item: {MenuItemId}", menuItemId);
                return StatusCode(500, new { success = false, message = "Error retrieving reviews" });
            }
        }

        [HttpGet("users/{userId}/reviews")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetReviewsByUser(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (currentUserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                var reviews = await _reviewRepository.GetReviewsByUserIdAsync(userId);
                var pagedReviews = reviews
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ReviewDto
                    {
                        ReviewId = r.ReviewId,
                        UserId = r.UserId,
                        MenuItemId = r.MenuItemId,
                        OrderId = r.OrderId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt,
                        IsVerifiedPurchase = r.IsVerifiedPurchase
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        reviews = pagedReviews,
                        pagination = new
                        {
                            currentPage = page,
                            pageSize = pageSize,
                            totalPages = (int)Math.Ceiling(reviews.Count() / (double)pageSize)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for user: {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Error retrieving reviews" });
            }
        }

        [HttpPut("reviews/{reviewId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                var review = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (review == null)
                {
                    return NotFound(new { success = false, message = "Review not found" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (review.UserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                if (dto.Rating < 1 || dto.Rating > 5)
                {
                    return BadRequest(new { success = false, message = "Rating must be between 1 and 5" });
                }

                review.Rating = dto.Rating;
                review.Comment = dto.Comment;
                review.UpdatedAt = DateTime.UtcNow;

                var updatedReview = await _reviewRepository.UpdateReviewAsync(review);

                return Ok(new
                {
                    success = true,
                    message = "Review updated successfully",
                    data = new ReviewDto
                    {
                        ReviewId = updatedReview.ReviewId,
                        UserId = updatedReview.UserId,
                        MenuItemId = updatedReview.MenuItemId,
                        OrderId = updatedReview.OrderId,
                        Rating = updatedReview.Rating,
                        Comment = updatedReview.Comment,
                        CreatedAt = updatedReview.CreatedAt,
                        UpdatedAt = updatedReview.UpdatedAt,
                        IsVerifiedPurchase = updatedReview.IsVerifiedPurchase
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review: {ReviewId}", reviewId);
                return StatusCode(500, new { success = false, message = "Error updating review" });
            }
        }

        [HttpDelete("reviews/{reviewId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            try
            {
                var review = await _reviewRepository.GetReviewByIdAsync(reviewId);
                if (review == null)
                {
                    return NotFound(new { success = false, message = "Review not found" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (review.UserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                var result = await _reviewRepository.DeleteReviewAsync(reviewId);
                if (!result)
                {
                    return StatusCode(500, new { success = false, message = "Failed to delete review" });
                }

                return Ok(new { success = true, message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review: {ReviewId}", reviewId);
                return StatusCode(500, new { success = false, message = "Error deleting review" });
            }
        }
    }
}