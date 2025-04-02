using api.Dtos.User;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost]
        [Route("register-user")]
        public async Task<IActionResult> Create([FromBody] CreateUserRequestDto userDto)
        {
            switch (userDto.Role)
            {
                case "Admin":
                case "User":
                case "Seller":
                    break;
                default:
                    return StatusCode(400,
                        new
                        {
                            success = false,
                            message = "Invalid role. Please provide a valid role (Admin, User, Seller)."
                        });
            }

            var users = await _userRepository.GetAllAsync();
            int newUserId = users.Any() ? users.Max(m => m.UserId) + 1 : 1;

            var userModel = userDto.ToUserFromCreateDto();
            userModel.CreatedAt = userModel.CreatedAt.ToUniversalTime();
            userModel.UserId = newUserId;

            await _userRepository.CreateAsync(userModel);

            return Ok(new { success = true, message = "User created successfully", userId = newUserId });
        }

        [HttpGet]
        [Route("get-users")]
        public async Task<IActionResult> Get()
        {
            var users = await _userRepository.GetAllAsync();
            if (!users.Any())
            {
                return NotFound(new { success = false, message = "No users found" });
            }

            return Ok(users);
        }

        [HttpGet]
        [Route("get-user/{userId}")]
        [HttpGet]
        public async Task<IActionResult> Get(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            var userDto = user.ToUserDto();
            return Ok(new { success = true, data = userDto });
        }

        [HttpPost]
        [Route("login-user")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequestDto userDto)
        {
            var (user, token) = await _userRepository.LoginAsync(userDto.Email, userDto.Password);
            if (user == null || token == null)
            {
                return Unauthorized(new { success = false, message = "Invalid email or password" });
            }

            var userResponse = user.ToUserDto();
            return Ok(new { success = true, data = userResponse, token });
        }
    }
}