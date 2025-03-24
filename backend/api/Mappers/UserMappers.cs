using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.User;
using api.Models;

namespace api.Mappers
{
    public static class UserMappers
    {
        public static UserDto ToUserDto(this User userModel)
        {
            return new UserDto
            {
                UserId = userModel.UserId,
                Name = userModel.Name,
                Email = userModel.Email,
                Role = userModel.Role,
                CreatedAt = userModel.CreatedAt
            };
        }

        public static User ToUserFromCreateDto(this CreateUserRequestDto userDto)
        {
            return new User
            {
                Name = userDto.Name,
                Email = userDto.Email,
                Role = userDto.Role,
                CreatedAt = userDto.CreatedAt
            };
        }

        public static User ToUserFromLoginDto(this LoginUserRequestDto userDto)
        {
            return new User
            {
                Email = userDto.Email,
            };
        }
    }
}