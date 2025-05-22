using FluentValidation;
using api.Dtos.User;

namespace api.Validators
{
    public class CreateUserValidator : AbstractValidator<CreateUserRequestDto>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required")
                .MinimumLength(2).WithMessage("Name must be at least 2 characters long")
                .MaximumLength(50).WithMessage("Name cannot exceed 50 characters");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(5).WithMessage("Password must be at least 5 characters long");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required")
                .Must(role => role == "Admin" || role == "User")
                .WithMessage("Role must be either 'Admin' or 'User'");
        }
    }

    public class UpdateUserValidator : AbstractValidator<UpdateUserRequestDto>
    {
        public UpdateUserValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2).WithMessage("Name must be at least 2 characters long")
                .MaximumLength(50).WithMessage("Name cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.Role)
                .Must(role => string.IsNullOrEmpty(role) || role == "Admin" || role == "User" || role == "Seller")
                .WithMessage("Role must be either 'Admin', 'User', or 'Seller'");
        }
    }

    public class LoginUserValidator : AbstractValidator<LoginUserRequestDto>
    {
        public LoginUserValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }

    public class RefreshTokenValidator : AbstractValidator<RefreshTokenRequestDto>
    {
        public RefreshTokenValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required");

            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("Refresh token is required")
                .MinimumLength(32).WithMessage("Invalid refresh token format");
        }
    }
}