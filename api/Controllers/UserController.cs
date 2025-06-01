using api.Dtos.User;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserRepository userRepository, ISellerRepository sellerRepository, ILogger<UserController> logger)
        {
            _userRepository = userRepository;
            _sellerRepository = sellerRepository;
            _logger = logger;
        }

        [HttpPost]
        [Route("register")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] CreateUserRequestDto userDto)
        {
            try
            {
                // Check if email is already registered
                var existingUser = await _userRepository.GetByEmailAsync(userDto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "Email already registered" });
                }

                // Validate role
                if (!ValidateRole(userDto.Role))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid role. Please provide a valid role (Admin, User, Seller)."
                    });
                }

                var userModel = userDto.ToUserFromCreateDto();
                var createdUser = await _userRepository.CreateAsync(userModel);

                _logger.LogInformation("User registered successfully: {Email}", userDto.Email);

                var userResponse = createdUser.ToUserDto();
                return StatusCode(201, new
                {
                    success = true,
                    message = "User registered successfully",
                    data = userResponse
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user: {Email}", userDto.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while registering the user"
                });
            }
        }

        [HttpPost]
        [Route("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginUserRequestDto userDto)
        {
            try
            {
                var (user, token) = await _userRepository.LoginAsync(userDto.Email, userDto.Password);
                if (user == null || token == null)
                {
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                _logger.LogInformation("User logged in successfully: {Email}", userDto.Email);
                var userResponse = user.ToUserDto();

                // If the user is a seller, get seller information
                object? sellerInfo = null;
                if (user.Role == "Seller")
                {
                    var seller = await _sellerRepository.GetSellerByUserIdAsync(user.UserId);
                    if (seller != null)
                    {
                        sellerInfo = new
                        {
                            sellerId = seller.SellerId,
                            storeName = seller.StoreName,
                            storeImageUrl = seller.StoreImageUrl,
                            description = seller.Description
                        };
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    data = new
                    {
                        user = userResponse,
                        seller = sellerInfo,
                        token = token,
                        refreshToken = user.RefreshToken,
                        expiresIn = 3600 // Token expiration in seconds
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login: {Email}", userDto.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred during login"
                });
            }
        }

        [HttpPost]
        [Route("refresh-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto refreshRequest)
        {
            try
            {
                var (token, refreshToken) = await _userRepository.RefreshTokenAsync(
                    refreshRequest.UserId,
                    refreshRequest.RefreshToken
                );

                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid refresh token"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        token = token,
                        refreshToken = refreshToken,
                        expiresIn = 3600
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token for user: {UserId}", refreshRequest.UserId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while refreshing the token"
                });
            }
        }

        [HttpPost]
        [Route("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto forgotPasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid email format"
                    });
                }

                var result = await _userRepository.SendPasswordResetEmailAsync(forgotPasswordDto.Email);

                // Always return success to avoid revealing if email exists
                return Ok(new
                {
                    success = true,
                    message = "If an account with that email exists, a password reset link has been sent"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot password request for email: {Email}", forgotPasswordDto.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while processing your request"
                });
            }
        }

        [HttpGet]
        [Route("users")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                if (!users.Any())
                {
                    return NotFound(new { success = false, message = "No users found" });
                }

                // Apply pagination
                var paginatedUsers = users
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => u.ToUserDto())
                    .ToList();

                var totalUsers = users.Count();
                var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        users = paginatedUsers,
                        pagination = new
                        {
                            currentPage = page,
                            pageSize = pageSize,
                            totalPages = totalPages,
                            totalItems = totalUsers
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while retrieving users"
                });
            }
        }

        [HttpPut]
        [Route("users/{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequestDto updateUserDto)
        {
            try
            {
                // Check if the user exists
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }                // Get current user info from token
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Get the current user by Firebase UID to get their actual UserId
                string? currentUserId = null;
                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    var users = await _userRepository.GetAllAsync();
                    var currentUser = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                    currentUserId = currentUser?.UserId;
                }

                // Security check: Only allow users to update their own data OR admins to update any user
                if (currentUserId != id && currentUserRole != "Admin")
                {
                    return StatusCode(403, new { success = false, message = "You don't have permission to update this user" });
                }

                // Additional validation for role changes
                if (!string.IsNullOrEmpty(updateUserDto.Role) &&
                    updateUserDto.Role != user.Role &&
                    currentUserRole != "Admin")
                {
                    return StatusCode(403, new { success = false, message = "Only administrators can change user roles" });
                }

                // Validate role if provided
                if (!string.IsNullOrEmpty(updateUserDto.Role) && !ValidateRole(updateUserDto.Role))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid role. Please provide a valid role (Admin, User, Seller)."
                    });
                }                // Update email check: Ensure new email is not already taken by someone else
                if (!string.IsNullOrEmpty(updateUserDto.Email) &&
                    !updateUserDto.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
                {
                    var existingUser = await _userRepository.GetByEmailAsync(updateUserDto.Email);
                    if (existingUser != null && existingUser.UserId != id)
                    {
                        return BadRequest(new { success = false, message = "Email is already registered by another user" });
                    }
                }

                // Store original user for email update comparison
                var originalUser = await _userRepository.GetByIdAsync(id);
                if (originalUser == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Apply updates to user object
                user.UpdateUserFromDto(updateUserDto);

                // Save the updated user with email synchronization
                var result = await _userRepository.UpdateUserWithEmailAsync(originalUser, user);
                if (!result)
                {
                    return StatusCode(500, new { success = false, message = "Failed to update user" });
                }

                _logger.LogInformation("User updated successfully: {UserId}", id);

                return Ok(new
                {
                    success = true,
                    message = "User updated successfully",
                    data = user.ToUserDto()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {UserId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while updating the user"
                });
            }
        }

        [HttpGet]
        [Route("analytics")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAnalytics()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                var sellers = await _sellerRepository.GetAllApplicationsAsync("Pending");

                var totalActiveUsers = users.Count(u => u.Role == "User" && u.IsActive);
                var totalActiveSellers = users.Count(u => u.Role == "Seller" && u.IsActive);
                var pendingApprovals = sellers.Count();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        activeUsers = totalActiveUsers,
                        activeSellers = totalActiveSellers,
                        pendingApprovals = pendingApprovals
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving analytics data");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while retrieving analytics data"
                });
            }
        }

        private bool ValidateRole(string role)
        {
            var validRoles = new[] { "Admin", "User", "Seller" };
            return validRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
        }
    }
}