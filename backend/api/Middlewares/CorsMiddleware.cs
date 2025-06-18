using System.Net;

namespace api.Middlewares;

public class CorsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public CorsMiddleware(RequestDelegate next, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _next = next;
        _configuration = configuration;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var origin = context.Request.Headers["Origin"].FirstOrDefault();

        // List of allowed origins
        var allowedOrigins = new List<string>();

        if (_environment.IsDevelopment())
        {
            // Allow any origin in development
            if (!string.IsNullOrEmpty(origin))
            {
                allowedOrigins.Add(origin);
            }
        }
        else
        {
            // Production allowed origins
            allowedOrigins.AddRange(new[]
            {
                "https://foodhub.marcelpeterson.me",
                "https://www.foodhub.marcelpeterson.me",
                "https://foodhub-project.vercel.app",
                "http://localhost:3000",
                "http://localhost:3001"
            });
        }

        // Check if the origin is allowed
        if (!string.IsNullOrEmpty(origin) && IsOriginAllowed(origin, allowedOrigins))
        {
            context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
            context.Response.Headers.Add("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Api-Version");
            context.Response.Headers.Add("Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
            context.Response.Headers.Add("Access-Control-Max-Age", "86400");
        }

        // Handle preflight requests
        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = (int)HttpStatusCode.OK;
            return;
        }

        await _next(context);
    }

    private static bool IsOriginAllowed(string origin, List<string> allowedOrigins)
    {
        return allowedOrigins.Any(allowed =>
            string.Equals(allowed, origin, StringComparison.OrdinalIgnoreCase));
    }
}
