using api.Dtos.Menu;
using api.Interfaces;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuRepository _menuRepository;
        public MenuController(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
        }

        [HttpPost]
        [Route("create-menu")]
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
    }
}