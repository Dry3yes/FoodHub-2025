using FoodHubProject.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FoodHubProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly FirebaseService _firebaseService;

        public MenuController(FirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }

        [HttpPost("UploadMenuPhoto")]
        public async Task<IActionResult> UploadMenuPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File tidak boleh kosong.");
            }

            try
            {
                var url = await _firebaseService.UploadFileAsync(file, "uploads");
                return Ok(new { Url = url });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error upload file: {ex.Message}");
            }
        }
    }
}
