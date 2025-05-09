using FluentValidation;
using api.Dtos.Seller;

namespace api.Validators
{
    public class CreateSellerApplicationValidator : AbstractValidator<CreateSellerApplicationDto>
    {
        public CreateSellerApplicationValidator()
        {
            RuleFor(x => x.StoreName)
                .NotEmpty().WithMessage("Store name is required")
                .Length(2, 100).WithMessage("Store name must be between 2 and 100 characters");

            RuleFor(x => x.UserIdentificationNumber)
                .NotEmpty().WithMessage("Identification number is required")
                .Length(16).WithMessage("Identification number must be 16 characters");

            RuleFor(x => x.IdentificationUrl)
                .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Identification URL must be a valid URL")
                .When(x => !string.IsNullOrEmpty(x.IdentificationUrl));
        }
    }
}