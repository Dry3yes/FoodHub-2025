using api.Dtos.Menu;
using api.Models;

namespace api.Mappers
{
    public static class MenuMappers
    {
        public static MenuDto ToMenuDto(this Menu menuModel)
        {
            return new MenuDto
            {
                Id = menuModel.Id,
                SellerId = menuModel.SellerId,
                StoreName = menuModel.StoreName,
                ItemName = menuModel.ItemName,
                Price = menuModel.Price,
                ImageURL = menuModel.ImageURL,
                Category = menuModel.Category,
                IsOutOfStock = menuModel.IsOutOfStock,
                CreatedAt = menuModel.CreatedAt
            };
        }

        public static Menu ToMenuFromCreateDto(this CreateMenuRequestDto menuDto)
        {
            return new Menu
            {
                ItemName = menuDto.ItemName,
                Price = menuDto.Price,
                ImageURL = menuDto.ImageURL ?? string.Empty,
                Category = menuDto.Category,
                IsOutOfStock = menuDto.IsOutOfStock,
                CreatedAt = menuDto.CreatedAt
            };
        }

        public static Menu ToMenuFromUpdateDto(this UpdateMenuRequestDto menuDto)
        {
            return new Menu
            {
                ItemName = menuDto.ItemName,
                Price = menuDto.Price,
                ImageURL = menuDto.ImageURL,
                Category = menuDto.Category,
                IsOutOfStock = menuDto.IsOutOfStock,
                CreatedAt = menuDto.CreatedAt
            };
        }
    }
}