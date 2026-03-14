using MyApp.Application.DTOs.Authen;
using Microsoft.AspNetCore.Http.Features;

namespace MyApp.Infrastructure.Identity
{
    public class UserPrincipalService : IUserPrincipalService
    {
        private HttpContext _httpContext;

        private UserLogin _user;

        private readonly IConfiguration _configuration;

        public UserPrincipalService(IHttpContextAccessor ihttpContext, IConfiguration configuration)
        {
            _httpContext = ihttpContext.HttpContext!;
            _configuration = configuration;
        }

        public string GetClientIPAddress()
        {
            string ip = string.Empty;
            if (!string.IsNullOrEmpty(_httpContext.Request.Headers["X-Forwarded-For"]))
            {
                ip = _httpContext.Request.Headers["X-Forwarded-For"];
            }
            else
            {
                ip = _httpContext.Request.HttpContext.Features.Get<IHttpConnectionFeature>().RemoteIpAddress.ToString();
            }
            return ip;
        }

        public UserLogin GetUserLogin()
        {
            if (_user != null) return _user;
            try
            {
                if (_httpContext == null) return null;
                _user = (UserLogin)_httpContext.Items["Accounts"]!;
                return _user;

            }
            catch (System.Exception)
            {
                return null;
            }
        }

        public bool IsMobile()
        {
            var isMobile = false;
            var device = _httpContext.Request.Headers["Device"];
            if (device.ToString().ToLower() == "mobile")
            {
                isMobile = true;
            }
            return isMobile;
        }
    }
}
