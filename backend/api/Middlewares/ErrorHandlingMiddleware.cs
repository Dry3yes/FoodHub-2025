using System.Net;
using System.Text.Json;

namespace api.Middlewares
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                var response = context.Response;
                response.ContentType = "application/json";                // Preserve CORS headers in error responses
                var origin = context.Request.Headers["Origin"].FirstOrDefault();
                if (!string.IsNullOrEmpty(origin))
                {
                    var allowedOrigins = new List<string>
                    {
                        "https://foodhub.marcelpeterson.me",
                        "https://www.foodhub.marcelpeterson.me",
                        "https://foodhub-project.vercel.app",
                        "http://localhost:3000",
                        "http://localhost:3001"
                    };

                    if (allowedOrigins.Contains(origin) ||
                        context.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment() == true)
                    {
                        response.Headers["Access-Control-Allow-Origin"] = origin;
                        response.Headers["Access-Control-Allow-Credentials"] = "true";
                    }
                }

                switch (error)
                {
                    case KeyNotFoundException:
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        break;
                    case UnauthorizedAccessException:
                        response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        break;
                    case ArgumentException:
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        break;
                    default:
                        _logger.LogError(error, error.Message);
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        break;
                }

                var result = JsonSerializer.Serialize(new
                {
                    success = false,
                    message = error.Message,
                    details = error.StackTrace
                });

                await response.WriteAsync(result);
            }
        }
    }
}