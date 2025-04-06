using api.Dtos.User;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserRepository userRepository, ILogger<UserController> logger)
        {
            _userRepository = userRepository;
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

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    data = new
                    {
                        user = userResponse,
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

        [HttpGet]
        [Route("users/{userId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUser(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Only allow users to access their own data unless they're an admin
                var userRole = User.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;

                if (userRole != "Admin" && userIdClaim != userId)
                {
                    return Forbid();
                }

                var userResponse = user.ToUserDto();
                return Ok(new
                {
                    success = true,
                    data = userResponse
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while retrieving the user"
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