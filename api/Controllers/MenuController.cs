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
        private readonly IImageService _imageService;
        private readonly ILogger<MenuController> _logger;

        public MenuController(
            IMenuRepository menuRepository,
            IImageService imageService,
            ILogger<MenuController> logger)
        {
            _menuRepository = menuRepository;
            _imageService = imageService;
            _logger = logger;
        }

        [HttpPost]
        [Route("create-menu")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> Create([FromForm] CreateMenuRequestDto menuDto, IFormFile image)
        {
            try
            {
                // Upload image first
                string? imageUrl = null;
                if (image != null)
                {
                    imageUrl = await _imageService.UploadImageAsync(image);
                }

                var menuModel = menuDto.ToMenuFromCreateDto();
                menuModel.CreatedAt = menuModel.CreatedAt.ToUniversalTime();
                menuModel.ImageURL = imageUrl ?? string.Empty;

                await _menuRepository.CreateMenuAsync(menuModel);

                return Ok(new { success = true, message = "Menu created successfully", data = new { imageUrl } });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu");
                return StatusCode(500, new { success = false, message = "Error creating menu" });
            }
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
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMenuRequestDto menuDto)
        {
            var menu = await _menuRepository.GetMenuByIdAsync(id);
            if (menu == null)
            {
                return NotFound(new { success = false, message = "Menu not found" });
            }

            var updatedMenu = menuDto.ToMenuFromUpdateDto();
            updatedMenu.CreatedAt = menu.CreatedAt.ToUniversalTime();

            await _menuRepository.UpdateMenuAsync(updatedMenu);

            return Ok(new { success = true, message = "Menu updated successfully" });
        }

        [HttpDelete]
        [Route("delete-menu/{id}")]
        [Authorize(Roles = "Seller")]
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

        [HttpGet]
        [Route("get-image-url/{imageName}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetImageUrl(string imageName)
        {
            try
            {
                var imageUrl = await _imageService.GetImageUrlAsync(imageName);
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