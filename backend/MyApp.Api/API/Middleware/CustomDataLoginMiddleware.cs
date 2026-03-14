using Azure.Core;
using MyApp.Application.DTOs.Authen;
using System;

namespace MyApp.Api.API.Middleware
{
    public class CustomDataLoginMiddleware
    {
        private readonly RequestDelegate _next;
        public CustomDataLoginMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            var userContext = context.User;
            if (userContext?.Identity?.IsAuthenticated == true)
            {
                var userId = userContext.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var username = userContext.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                var email = userContext.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                var roles = userContext.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
                var permissions = userContext.FindAll("permission").Select(c => c.Value).ToList();

                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    authHeader = authHeader.Substring(7); // Bỏ "Bearer "
                }

                var userLogin = new UserLogin()
                {
                    Id = Guid.TryParse(userId, out Guid idGuid) ? idGuid : Guid.Empty,
                    DonViId = Guid.Empty,
                    IdChiNhanh = Guid.Empty,
                    Token = authHeader,
                    UserName = username ?? "",
                    Email = email ?? ""
                };

                context.Items["Accounts"] = userLogin;
            }
            await _next(context);
        }
    }
}
