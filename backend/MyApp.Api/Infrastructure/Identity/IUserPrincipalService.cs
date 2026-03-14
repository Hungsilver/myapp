using MyApp.Application.DTOs.Authen;

namespace MyApp.Infrastructure.Identity
{
    public interface IUserPrincipalService
    {
        UserLogin GetUserLogin();
        string GetClientIPAddress();
        bool IsMobile();
    }
}
