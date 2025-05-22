
namespace api.Middlewares
{
    public class RequestTimeoutMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestTimeoutMiddleware> _logger;
        private readonly TimeSpan _timeout = TimeSpan.FromSeconds(30); // 30 second timeout

        public RequestTimeoutMiddleware(RequestDelegate next, ILogger<RequestTimeoutMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            using var cts = new CancellationTokenSource();
            var timeoutTask = Task.Delay(_timeout, cts.Token);
            var processRequest = ProcessRequestAsync(context, cts.Token);

            var completedTask = await Task.WhenAny(processRequest, timeoutTask);
            if (completedTask == timeoutTask)
            {
                cts.Cancel();
                context.Response.StatusCode = StatusCodes.Status408RequestTimeout;
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Request timed out"
                });

                _logger.LogWarning("Request to {Path} timed out after {Timeout} seconds",
                    context.Request.Path, _timeout.TotalSeconds);
                return;
            }

            cts.Cancel();
            await processRequest;
        }

        private async Task ProcessRequestAsync(HttpContext context, CancellationToken cancellationToken)
        {
            try
            {
                await _next(context);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // Request was canceled due to timeout
                throw;
            }
        }
    }
}