using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.User;
using api.Interfaces;
using api.Mappers;
using api.Models;
using api.Services;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly FirebaseAuthService _firebaseAuthService;
        private readonly IUserRepository _userRepository;
        public UserController(FirestoreDb firestoreDb, IUserRepository userRepository, FirebaseAuthService firebaseAuthService)
        {
            _firestoreDb = firestoreDb;
            _userRepository = userRepository;
            _firebaseAuthService = firebaseAuthService;
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
                    return StatusCode(400, new { success = false, message = "Invalid role. Please provide a valid role (Admin, User, Seller)." });
            }

            var users = await _userRepository.GetAllAsync();
            int newUserId = users.Any() ? users.Max(u => u.UserId) + 1 : 1;

            var userModel = userDto.ToUserFromCreateDto();
            userModel.CreatedAt = userModel.CreatedAt.ToUniversalTime();
            userModel.UserId = newUserId;

            await _firebaseAuthService.RegisterUserAsync(userDto.Email, userDto.Password);

            await _userRepository.CreateAsync(userModel);

            return Ok(new { success = true, message = "User created successfully", userId = newUserId });
        }

        [HttpGet]
        [Route("get-users")]
        public async Task<IActionResult> Get()
        {
            var users = await _userRepository.GetAllAsync();

            var usersDto = users.Select(u => u.ToUserDto());

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
                return StatusCode(404, new { success = false, message = "User not found." });
            }

            return Ok(user.ToUserDto());
        }

        [HttpPost]
        [Route("login-user")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequestDto userDto)
        {
            if (userDto == null || string.IsNullOrEmpty(userDto.Email) || string.IsNullOrEmpty(userDto.Password))
            {
                return StatusCode(400, new { success = false, message = "Email and password are required." });
            }

            var token = await _firebaseAuthService.LoginUserAsync(userDto.Email, userDto.Password);

            if (string.IsNullOrEmpty(token))
            {
                return StatusCode(401, new { success = false, message = "Invalid email or password." });
            }

            var user = await _userRepository.GetByEmailAsync(userDto.Email);

            if (user == null)
            {
                return StatusCode(404, new { success = false, message = "User not found." });
            }

            return Ok(new
            {
                success = true,
                message = "User logged in successfully",
                userId = user.UserId,
                role = user.Role,
                token
            });
        }
    }
}