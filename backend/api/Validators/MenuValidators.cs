using FluentValidation;
using api.Dtos.Menu;

namespace api.Validators
{
    public class CreateMenuRequestValidator : AbstractValidator<CreateMenuRequestDto>
    {
        public CreateMenuRequestValidator()
        {
            RuleFor(x => x.ItemName)
                .NotEmpty().WithMessage("Item name is required")
                .Length(2, 100).WithMessage("Item name must be between 2 and 100 characters");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0");

            RuleFor(x => x.ImageURL)
                .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Image URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.ImageURL));

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required")
                .Must(category => new[] { "Makanan", "Minuman" }.Contains(category))
                .WithMessage("Category must be one of: Makanan, Minuman");

            RuleFor(x => x.Stock)
                .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative");
        }
    }

    public class UpdateMenuRequestValidator : AbstractValidator<UpdateMenuRequestDto>
    {
        public UpdateMenuRequestValidator()
        {
            RuleFor(x => x.ItemName)
                .NotEmpty().WithMessage("Item name is required")
                .Length(2, 100).WithMessage("Item name must be between 2 and 100 characters");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0");

            RuleFor(x => x.ImageURL)
                .NotEmpty().WithMessage("Image URL is required")
                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Image URL must be a valid URL");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required")
                .Must(category => new[] { "Makanan", "Minuman" }.Contains(category))
                .WithMessage("Category must be one of: Makanan, Minuman");

            RuleFor(x => x.Stock)
                .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative");
        }
    }
}