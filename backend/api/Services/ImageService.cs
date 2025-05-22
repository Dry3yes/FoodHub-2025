using api.Interfaces;
using Microsoft.AspNetCore.Http;

namespace api.Services
{
    public class ImageService : IImageService
    {
        private readonly CloudflareClient _cloudflareClient;
        private readonly ILogger<ImageService> _logger;

        public ImageService(
            CloudflareClient cloudflareClient,
            ILogger<ImageService> logger)
        {
            _cloudflareClient = cloudflareClient;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                throw new ArgumentException("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            using (var stream = file.OpenReadStream())
            {
                await _cloudflareClient.UploadImage(stream, fileName, file.ContentType);
            }

            // Construct the full URL for the uploaded image
            var imageUrl = $"https://pub-660f0d3867ae4ac3ad910f4e67f967cd.r2.dev/{fileName}";

            _logger.LogInformation("Image uploaded successfully: {FileName}", fileName);

            return imageUrl;
        }

        public async Task DeleteImageAsync(string imageName)
        {
            try
            {
                await _cloudflareClient.DeleteImage(imageName);
                _logger.LogInformation("Image deleted successfully: {ImageName}", imageName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImageName}", imageName);
                throw;
            }
        }

        public async Task<string> GetImageUrlAsync(string imageName)
        {
            try
            {
                return await _cloudflareClient.GetImageUrl(imageName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving image URL: {ImageName}", imageName);
                throw;
            }
        }
    }
}