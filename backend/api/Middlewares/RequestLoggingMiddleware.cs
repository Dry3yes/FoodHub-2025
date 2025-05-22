using System.Diagnostics;

namespace api.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestBody = string.Empty;

            try
            {
                // Log request details
                _logger.LogInformation(
                    "Incoming {Method} request to {Path}",
                    context.Request.Method,
                    context.Request.Path);

                await _next(context);

                stopwatch.Stop();

                // Log response details
                _logger.LogInformation(
                    "Response {StatusCode} for {Method} {Path} completed in {Elapsed}ms",
                    context.Response.StatusCode,
                    context.Request.Method,
                    context.Request.Path,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "Request {Method} {Path} failed in {Elapsed}ms",
                    context.Request.Method,
                    context.Request.Path,
                    stopwatch.ElapsedMilliseconds);
                throw;
            }
        }
    }
}