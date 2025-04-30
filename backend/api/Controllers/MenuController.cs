using api.Dtos.Menu;
using api.Interfaces;
using api.Mappers;
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
        public MenuController(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
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

        [HttpGet]
        [Route("search-menus")]
        [AllowAnonymous]
        [ResponseCache(Duration = 30)]  // Cache for 30 seconds
        public async Task<IActionResult> SearchMenus(
            [FromQuery] string searchTerm,
            [FromQuery] string? category = null,
            [FromQuery] double? minPrice = null,
            [FromQuery] double? maxPrice = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { success = false, message = "Search term is required" });
                }

                var menus = await _menuRepository.SearchMenusAsync(searchTerm, category, minPrice, maxPrice);
                
                if (!menus.Any())
                {
                    return NotFound(new { success = false, message = "No menus found matching your criteria" });
                }

                var menuDtos = menus.Select(m => m.ToMenuDto());
                
                return Ok(new 
                { 
                    success = true, 
                    data = menuDtos,
                    totalResults = menuDtos.Count()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error searching menus", error = ex.Message });
            }
        }
    }
}