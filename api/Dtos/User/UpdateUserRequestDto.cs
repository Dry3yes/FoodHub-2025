using System;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.User
{
    public class UpdateUserRequestDto
    {
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}