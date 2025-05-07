using api.Dtos.Menu;
using api.Interfaces;
using api.Mappers;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]  // Disable caching by default
    public class MenuController : ControllerBase
    {
        private readonly IMenuRepository _menuRepository;
        private readonly CloudflareClient _cloudflareClient;
        private readonly ILogger<MenuController> _logger;

        public MenuController(
            IMenuRepository menuRepository,
            CloudflareClient cloudflareClient,
            ILogger<MenuController> logger)
        {
            _menuRepository = menuRepository;
            _cloudflareClient = cloudflareClient;
            _logger = logger;
        }

        [HttpPost]
        [Route("create-menu")]
        [Authorize(Roles = "Admin,Seller")]
        public async Task<IActionResult> Create([FromBody] CreateMenuRequestDto menuDto)
        {
            var items = await _menuRepository.GetAllMenusAsync();
            int newItemId = items.Any() ? items.Max(m => m.ItemId) + 1 : 1;

            var menuModel = menuDto.ToMenuFromCreateDto();
            menuModel.CreatedAt = menuModel.CreatedAt.ToUniversalTime();
            menuModel.ItemId = newItemId;

            await _menuRepository.CreateMenuAsync(menuModel);

            return Ok(new { success = true, message = "Menu created successfully", itemId = newItemId });
        }

        [HttpGet]
        [Route("get-menus")]
        [AllowAnonymous]
        [ResponseCache(Duration = 60)]  // Cache for 1 minute
        public async Task<IActionResult> Get()
        {
            var menus = await _menuRepository.GetAllMenusAsync();
            if (!menus.Any())
            {
                return NotFound(new { success = false, message = "No menus found" });
            }
            var menuDtos = menus.Select(m => m.ToMenuDto()).ToList();

            return Ok(new { success = true, data = menuDtos });
        }

        [HttpGet]
        [Route("get-menu/{id}")]
        [AllowAnonymous]
        [ResponseCache(Duration = 60)]  // Cache for 1 minute
        public async Task<IActionResult> GetById(int id)
        {
            var menu = await _menuRepository.GetMenuByIdAsync(id);
            if (menu == null)
            {
                return NotFound(new { success = false, message = "Menu not found" });
            }
            var menuDto = menu.ToMenuDto();
            return Ok(new { success = true, data = menuDto });
        }

        [HttpPut]
        [Route("update-menu/{id}")]
        [Authorize(Roles = "Admin,Seller")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMenuRequestDto menuDto)
        {
            var menu = await _menuRepository.GetMenuByIdAsync(id);
            if (menu == null)
            {
                return NotFound(new { success = false, message = "Menu not found" });
            }

            var updatedMenu = menuDto.ToMenuFromUpdateDto();
            updatedMenu.ItemId = id;
            updatedMenu.CreatedAt = menu.CreatedAt.ToUniversalTime();

            await _menuRepository.UpdateMenuAsync(updatedMenu);

            return Ok(new { success = true, message = "Menu updated successfully" });
        }

        [HttpDelete]
        [Route("delete-menu/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var menu = await _menuRepository.GetMenuByIdAsync(id);
            if (menu == null)
            {
                return NotFound(new { success = false, message = "Menu not found" });
            }

            await _menuRepository.DeleteMenuAsync(id);

            return Ok(new { success = true, message = "Menu deleted successfully" });
        }

        [HttpGet]
        [Route("get-menus-by-category/{category}")]
        [AllowAnonymous]
        [ResponseCache(Duration = 60)]  // Cache for 1 minute
        public async Task<IActionResult> GetByCategory(string category)
        {
            var menus = await _menuRepository.GetMenusByCategoryAsync(category);
            if (!menus.Any())
            {
                return NotFound(new { success = false, message = "No menus found for this category" });
            }
            var menuDtos = menus.Select(m => m.ToMenuDto()).ToList();

            return Ok(new { success = true, data = menuDtos });
        }

        [HttpPost]
        [Route("upload-image")]
        [Authorize(Roles = "Admin,Seller")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                using (var stream = file.OpenReadStream())
                {
                    await _cloudflareClient.UploadImage(stream, fileName, file.ContentType);
                }

                // Construct the full URL for the uploaded image
                var imageUrl = $"https://pub-660f0d3867ae4ac3ad910f4e67f967cd.r2.dev/{fileName}";

                _logger.LogInformation("Image uploaded successfully: {FileName}", fileName);

                return Ok(new { success = true, data = new { url = imageUrl } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { success = false, message = "Error uploading image" });
            }
        }

        [HttpDelete]
        [Route("delete-image/{imageName}")]
        [Authorize(Roles = "Admin,Seller")]
        public async Task<IActionResult> DeleteImage(string imageName)
        {
            try
            {
                await _cloudflareClient.DeleteImage(imageName);
                return Ok(new { success = true, message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImageName}", imageName);
                return StatusCode(500, new { success = false, message = "Error deleting image" });
            }
        }

        [HttpGet]
        [Route("get-image-url/{imageName}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetImageUrl(string imageName)
        {
            try
            {
                var imageUrl = await _cloudflareClient.GetImageUrl(imageName);
                return Ok(new { success = true, data = new { url = imageUrl } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving image URL: {ImageName}", imageName);
                return StatusCode(500, new { success = false, message = "Error retrieving image URL" });
            }
        }

        
    }
}