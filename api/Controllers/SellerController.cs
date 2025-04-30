using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Seller;
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
    public class SellerController : ControllerBase
    {
        private readonly ISellerApplicationRepository _sellerRepo;
        private readonly IUserRepository _userRepo;
        private readonly ILogger<SellerController> _logger;

        public SellerController(
            ISellerApplicationRepository sellerRepo,
            IUserRepository userRepo,
            ILogger<SellerController> logger)
        {
            _sellerRepo = sellerRepo;
            _userRepo = userRepo;
            _logger = logger;
        }

        [HttpPost]
        [Route("seller-application")]
        [Authorize]
        public async Task<IActionResult> ApplyForSeller([FromBody] CreateSellerApplicationDto dto)
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get the actual user with DocumentId from Firestore
                var users = await _userRepo.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Check if user already has an application
                var existingApplication = await _sellerRepo.GetApplicationByUserIdAsync(user.UserId);
                if (existingApplication != null)
                {
                    return BadRequest(new { success = false, message = "User already has a pending application" });
                }

                var application = new SellerApplication
                {
                    UserId = user.UserId,
                    StoreName = dto.StoreName,
                    StoreDescription = dto.StoreDescription,
                    IdentificationUrl = dto.IdentificationUrl,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _sellerRepo.CreateApplicationAsync(application);

                return Ok(new
                {
                    success = true,
                    message = "Application submitted successfully",
                    applicationId = result.ApplicationId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating seller application");
                return StatusCode(500, new { success = false, message = "Error processing application" });
            }
        }

        [HttpGet]
        [Route("seller-applications")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllApplications([FromQuery] string status = "")
        {
            try
            {
                var applications = await _sellerRepo.GetAllApplicationsAsync(status);
                return Ok(new { success = true, data = applications });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving seller applications");
                return StatusCode(500, new { success = false, message = "Error retrieving applications" });
            }
        }

        [HttpPut]
        [Route("seller-applications/{id}/process")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ProcessApplication(string id, [FromBody] ProcessApplicationDto dto)
        {
            try
            {
                var application = await _sellerRepo.GetApplicationByIdAsync(id);
                if (application == null)
                {
                    return NotFound(new { success = false, message = "Application not found" });
                }

                if (application.Status != "Pending")
                {
                    return BadRequest(new { success = false, message = "Application already processed" });
                }

                application.Status = dto.Status;
                application.AdminMessage = dto.Message;
                application.ProcessedAt = DateTime.UtcNow;

                // If approved, update user role to Seller
                if (dto.Status == "Approved")
                {
                    var user = await _userRepo.GetByIdAsync(application.UserId);
                    if (user != null)
                    {
                        user.Role = "Seller";
                        await _userRepo.UpdateUserAsync(user);
                    }
                }

                await _sellerRepo.UpdateApplicationAsync(application);

                return Ok(new { success = true, message = $"Application {dto.Status.ToLower()}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing seller application: {Id}", id);
                return StatusCode(500, new { success = false, message = "Error processing application" });
            }
        }
    }
}