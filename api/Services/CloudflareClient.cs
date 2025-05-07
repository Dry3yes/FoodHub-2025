using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace api.Services
{
    public class CloudflareClient
    {
        private readonly string accountId;
        private readonly string accessKey;
        private readonly string accessSecret;

        public CloudflareClient(string accountId, string accessKey, string accessSecret)
        {
            this.accountId = accountId;
            this.accessKey = accessKey;
            this.accessSecret = accessSecret;
        }

        public async Task UploadImage(Stream image, string imageName, string type)
        {
            var s3Client = new AmazonS3Client(
                accessKey,
                accessSecret,
                new AmazonS3Config
                {
                    ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com"
                });

            var request = new PutObjectRequest
            {
                BucketName = "foodhub",
                Key = imageName,
                InputStream = image,
                ContentType = type,
                DisablePayloadSigning = true
            };

            var response = await s3Client.PutObjectAsync(request);

            if(response.HttpStatusCode != System.Net.HttpStatusCode.OK && response.HttpStatusCode != System.Net.HttpStatusCode.Accepted)
            {
                throw new Exception("Upload to Cloudflare R2 failed");
            }
        }

        public async Task DeleteImage(string imageName)
        {
            var s3Client = new AmazonS3Client(
                accessKey,
                accessSecret,
                new AmazonS3Config
                {
                    ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com"
                });

            var request = new DeleteObjectRequest
            {
                BucketName = "foodhub",
                Key = imageName
            };

            var response = await s3Client.DeleteObjectAsync(request);

            if(response.HttpStatusCode != System.Net.HttpStatusCode.NoContent)
            {
                throw new Exception("Delete from Cloudflare R2 failed");
            }
        }

        public async Task<string> GetImageUrl(string imageName)
        {
            var s3Client = new AmazonS3Client(
                accessKey,
                accessSecret,
                new AmazonS3Config
                {
                    ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com"
                });

            var request = new ListObjectsV2Request
            {
                BucketName = "foodhub",
            };

            var response = await s3Client.ListObjectsV2Async(request);
            

            var imageObject = response.S3Objects.FirstOrDefault(o => o.Key == imageName);
            if (imageObject != null)
            {
                return $"https://{accountId}.r2.cloudflarestorage.com/{imageObject.Key}";
            }
            throw new Exception("Image not found");
        }
    }
}