using MyApp.Api.Application.Services;
using MyApp.Application.Services.Auth;
using System.IdentityModel.Tokens.Jwt;

namespace MyApp.Infrastructure.Configs
{
    public static class DIServiceExtention
    {
        public static void DIServices(this IServiceCollection services, string connectionString)
        {
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<JwtSecurityTokenHandler>();
            services.AddScoped<IQuizService, QuizService>();
        }
    }
}
