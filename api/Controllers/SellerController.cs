using api.Dtos.Seller;
using api.Interfaces;
using api.Models;
using api.Services;
using api.Mappers;
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
        private readonly ISellerRepository _sellerRepo;
        private readonly IUserRepository _userRepo;
        private readonly IImageService _imageService;
        private readonly ILogger<SellerController> _logger;
        private readonly FirebaseAuthService _firebaseAuthService;

        public SellerController(
            ISellerRepository sellerRepo,
            IUserRepository userRepo,
            IImageService imageService,
            ILogger<SellerController> logger,
            FirebaseAuthService firebaseAuthService)
        {
            _sellerRepo = sellerRepo;
            _userRepo = userRepo;
            _imageService = imageService;
            _logger = logger;
            _firebaseAuthService = firebaseAuthService;
        }

        [HttpPost]
        [Route("seller-application")]
        [Authorize]
        public async Task<IActionResult> ApplyForSeller([FromForm] CreateSellerApplicationDto sellerDto, IFormFile image)
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

                string? imageUrl = null;
                if (image != null)
                {
                    imageUrl = await _imageService.UploadImageAsync(image);
                }

                var application = new SellerApplication
                {
                    UserId = user.UserId,
                    StoreName = sellerDto.StoreName,
                    UserIdentificationNumber = SellerMappers.HashIdentificationNumber(sellerDto.UserIdentificationNumber),
                    IdentificationUrl = imageUrl ?? string.Empty,
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
        public async Task<IActionResult> ProcessApplication(string id, [FromBody] ProcessApplicationDto sellerDto)
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

                application.Status = sellerDto.Status;
                application.AdminMessage = sellerDto.Message;
                application.ProcessedAt = DateTime.UtcNow;

                // If approved, update user role to Seller and delete the identification image
                if (sellerDto.Status == "Approved")
                {
                    var user = await _userRepo.GetByIdAsync(application.UserId);
                    if (user != null)
                    {
                        user.Role = "Seller";
                        await _userRepo.UpdateUserAsync(user);
                        
                        // Update Firebase Authentication custom claims
                        await _firebaseAuthService.SetUserRoleAsync(user.FirebaseUid, "Seller");
                    }

                    // Create a new seller document in the Sellers collection
                    var seller = new SellerApplication
                    {
                        UserId = application.UserId,
                        StoreName = application.StoreName,
                        UserIdentificationNumber = application.UserIdentificationNumber,
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow
                    };
                    await _sellerRepo.CreateAsync(seller.ToFirestoreDto());

                    // Delete the identification image if it exists
                    if (!string.IsNullOrEmpty(application.IdentificationUrl))
                    {
                        try
                        {
                            var imageName = Path.GetFileName(application.IdentificationUrl);
                            await _imageService.DeleteImageAsync(imageName);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error deleting identification image for application {Id}", id);
                            // Continue with the approval process even if image deletion fails
                        }
                    }
                }

                await _sellerRepo.UpdateApplicationAsync(application);

                return Ok(new { success = true, message = $"Application {sellerDto.Status.ToLower()}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing seller application: {Id}", id);
                return StatusCode(500, new { success = false, message = "Error processing application" });
            }
        }
    }
}