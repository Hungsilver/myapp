using System.Text.Json;

namespace MyApp.Application.Common
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // generate trace id (use existing TraceIdentifier)
            var traceId = context.TraceIdentifier;

            // map specific exceptions to status codes if needed
            var (statusCode, title) = MapExceptionToStatusCode(exception);

            // log with trace id
            _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);

            var apiError = MethodResult<object>.ResultWithError
                (
                    _env.IsDevelopment() ? exception.ToString() : "An unexpected error occurred."
                );
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            await context.Response.WriteAsync(JsonSerializer.Serialize(apiError, options));
        }

        private (int statusCode, string title) MapExceptionToStatusCode(Exception ex)
        {
            // Customize mapping depending on your domain exceptions
            return ex switch
            {
                ArgumentNullException _ => (400, "Bad Request"),
                ArgumentException _ => (400, "Bad Request"),
                KeyNotFoundException _ => (404, "Not Found"),
                UnauthorizedAccessException _ => (401, "Unauthorized"),
                // Add custom domain exceptions:
                // MyDomainValidationException _ => (422, "Unprocessable Entity"),
                _ => (500, "Internal Server Error")
            };
        }
    }
}
