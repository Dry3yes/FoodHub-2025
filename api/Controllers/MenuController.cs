using api.Dtos.Menu;
using api.Interfaces;
using api.Mappers;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace api.Controllers
{
    [Route("api/v{version:apiVersion}")]
    [ApiVersion("1.0")]
    [ApiController]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]  // Disable caching by default
    public class MenuController : ControllerBase
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IUserRepository _userRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly IImageService _imageService;
        private readonly ICachedMenuService _cachedMenuService;
        private readonly ILogger<MenuController> _logger;

        public MenuController(
            IMenuRepository menuRepository,
            IUserRepository userRepository,
            ISellerRepository sellerRepository,
            IImageService imageService,
            ICachedMenuService cachedMenuService,
            ILogger<MenuController> logger)
        {
            _menuRepository = menuRepository;
            _userRepository = userRepository;
            _sellerRepository = sellerRepository;
            _imageService = imageService;
            _cachedMenuService = cachedMenuService;
            _logger = logger;
        }

        [HttpPost]
        [Route("create-menu")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> Create([FromForm] CreateMenuRequestDto menuDto, IFormFile image)
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get the seller information based on the Firebase UID
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Get seller information based on the UserId
                var sellerEntity = await _sellerRepository.GetSellerByUserIdAsync(user.UserId);
                if (sellerEntity == null)
                {
                    return NotFound(new { success = false, message = "Seller not found for this user. You may need to apply to become a seller first." });
                }

                // Upload image first
                string? imageUrl = null;
                if (image != null)
                {
                    imageUrl = await _imageService.UploadImageAsync(image);
                }

                var menuModel = menuDto.ToMenuFromCreateDto();
                menuModel.CreatedAt = menuModel.CreatedAt.ToUniversalTime();
                menuModel.ImageURL = imageUrl ?? string.Empty;

                // Set seller information directly from the seller entity
                menuModel.SellerId = sellerEntity.SellerId;
                menuModel.StoreName = sellerEntity.StoreName; await _menuRepository.CreateMenuAsync(menuModel);

                // Invalidate caches after creating new menu
                await _cachedMenuService.InvalidateAllMenusCacheAsync();
                await _cachedMenuService.InvalidateSellerMenusCacheAsync(menuModel.SellerId);
                if (!string.IsNullOrEmpty(menuModel.Category))
                {
                    await _cachedMenuService.InvalidateCategoryMenusCacheAsync(menuModel.Category);
                }

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
        [ResponseCache(Duration = 600)]  // Cache for 10 minutes
        public async Task<IActionResult> Get()
        {
            var menus = await _cachedMenuService.GetAllMenusAsync();
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
        [ResponseCache(Duration = 900, VaryByQueryKeys = new[] { "id" })]  // Cache for 15 minutes
        public async Task<IActionResult> GetById(string id)
        {
            var menu = await _cachedMenuService.GetMenuByIdAsync(id);
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
        public async Task<IActionResult> Update(string id, [FromBody] UpdateMenuRequestDto menuDto)
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get the seller information based on the Firebase UID
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Get seller information based on the UserId
                var sellerEntity = await _sellerRepository.GetSellerByUserIdAsync(user.UserId);
                if (sellerEntity == null)
                {
                    return NotFound(new { success = false, message = "Seller not found for this user. You may need to apply to become a seller first." });
                }

                var menu = await _menuRepository.GetMenuByIdAsync(id);
                if (menu == null)
                {
                    return NotFound(new { success = false, message = "Menu not found" });
                }

                // Verify that the authenticated seller owns this menu
                if (menu.SellerId != sellerEntity.SellerId)
                {
                    return Forbid();
                }

                var updatedMenu = menuDto.ToMenuFromUpdateDto();
                updatedMenu.Id = menu.Id;
                updatedMenu.SellerId = menu.SellerId;
                updatedMenu.StoreName = menu.StoreName;
                updatedMenu.CreatedAt = menu.CreatedAt.ToUniversalTime(); await _menuRepository.UpdateMenuAsync(updatedMenu);

                // Invalidate caches after updating menu
                await _cachedMenuService.InvalidateMenuCacheAsync(updatedMenu.Id);
                await _cachedMenuService.InvalidateAllMenusCacheAsync();
                await _cachedMenuService.InvalidateSellerMenusCacheAsync(updatedMenu.SellerId);
                if (!string.IsNullOrEmpty(updatedMenu.Category))
                {
                    await _cachedMenuService.InvalidateCategoryMenusCacheAsync(updatedMenu.Category);
                }

                return Ok(new { success = true, message = "Menu updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating menu");
                return StatusCode(500, new { success = false, message = "Error updating menu" });
            }
        }

        [HttpDelete]
        [Route("delete-menu/{id}")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                // Get Firebase UID from claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                // Get the seller information based on the Firebase UID
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.FirebaseUid == firebaseUid);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Get seller information based on the UserId
                var sellerEntity = await _sellerRepository.GetSellerByUserIdAsync(user.UserId);
                if (sellerEntity == null)
                {
                    return NotFound(new { success = false, message = "Seller not found for this user. You may need to apply to become a seller first." });
                }

                var menu = await _menuRepository.GetMenuByIdAsync(id);
                if (menu == null)
                {
                    return NotFound(new { success = false, message = "Menu not found" });
                }

                // Verify that the authenticated seller owns this menu
                if (menu.SellerId != sellerEntity.SellerId)
                {
                    return Forbid();
                }
                await _menuRepository.DeleteMenuAsync(id);

                // Invalidate caches after deleting menu
                await _cachedMenuService.InvalidateMenuCacheAsync(id);
                await _cachedMenuService.InvalidateAllMenusCacheAsync();
                await _cachedMenuService.InvalidateSellerMenusCacheAsync(menu.SellerId);
                if (!string.IsNullOrEmpty(menu.Category))
                {
                    await _cachedMenuService.InvalidateCategoryMenusCacheAsync(menu.Category);
                }

                return Ok(new { success = true, message = "Menu deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting menu");
                return StatusCode(500, new { success = false, message = "Error deleting menu" });
            }
        }
        [HttpGet]
        [Route("get-menus-by-category/{category}")]
        [AllowAnonymous]
        [ResponseCache(Duration = 600, VaryByQueryKeys = new[] { "category" })] // Cache for 10 minutes
        public async Task<IActionResult> GetByCategory(string category)
        {
            var menus = await _cachedMenuService.GetMenusByCategoryAsync(category);
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
        [HttpGet]
        [Route("get-menus-by-store/{sellerId}")]
        [AllowAnonymous]
        [ResponseCache(Duration = 480, VaryByQueryKeys = new[] { "sellerId" })] // Cache for 8 minutes
        public async Task<IActionResult> GetMenuItemsByStore(string sellerId)
        {
            try
            {
                _logger.LogInformation("Fetching menus for seller ID: {SellerId}", sellerId);
                var storeMenus = await _cachedMenuService.GetMenusBySellerIdAsync(sellerId);
                if (!storeMenus.Any())
                {
                    _logger.LogInformation("No menus found for seller ID: {SellerId}", sellerId);
                    return NotFound(new { success = false, message = "No menus found for this store" });
                }
                var menuDtos = storeMenus.Select(m => m.ToMenuDto()).ToList();

                _logger.LogInformation("Successfully retrieved {Count} menus for seller ID: {SellerId}",
                                     menuDtos.Count, sellerId);
                return Ok(new { success = true, data = menuDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving menus for store {SellerId}", sellerId);
                return StatusCode(500, new { success = false, message = "Error retrieving menus for store" });
            }
        }
        [HttpGet]
        [Route("search-menus/{query}")]
        [AllowAnonymous]
        [ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "query" })] // Cache for 5 minutes
        public async Task<IActionResult> SearchMenus(string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return BadRequest(new { success = false, message = "Search query is required" });
                }

                _logger.LogInformation("Searching menus with query: {Query}", query);
                var searchResults = await _cachedMenuService.SearchMenusByNameAsync(query);

                if (!searchResults.Any())
                {
                    _logger.LogInformation("No menus found for search query: {Query}", query);
                    return NotFound(new { success = false, message = "No menus found matching your search" });
                }

                // Group by SellerId and get unique stores with their matching menu items
                var storesWithMenus = searchResults
                    .GroupBy(m => m.SellerId)
                    .Select(group => new
                    {
                        SellerId = group.Key,
                        StoreName = group.First().StoreName,
                        MatchingMenus = group.Select(m => m.ToMenuDto()).ToList()
                    })
                    .ToList();

                _logger.LogInformation("Found {Count} stores with matching menus for query: {Query}",
                                     storesWithMenus.Count, query);

                return Ok(new { success = true, data = storesWithMenus });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching menus with query: {Query}", query);
                return StatusCode(500, new { success = false, message = "Error searching menus" });
            }
        }
    }
}