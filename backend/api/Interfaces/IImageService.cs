using Microsoft.AspNetCore.Http;

namespace api.Interfaces
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task DeleteImageAsync(string imageName);
        Task<string> GetImageUrlAsync(string imageName);
    }
}