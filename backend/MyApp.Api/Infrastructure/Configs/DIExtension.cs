using AutoMapper;
using MyApp.Application.Common;
using MyApp.Infrastructure.Identity;
using MyApp.Infrastructure.Repositories;
using MyApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Infrastructure.Data;

namespace MyApp.Infrastructure.Configs
{
    public static class DIExtension
    {
        public static void DIContext(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<AppDbContext>(options =>
            {
                options.EnableSensitiveDataLogging();
                options.UseSqlServer(connectionString, sqlServerOptionsAction: sqlOption =>
                {
                    sqlOption.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(3),
                        errorNumbersToAdd: null
                        );
                }).UseLoggerFactory(LoggerFactory.Create(builder => builder.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.None)));
                //.AddInterceptors(new NoLockQueryInterceptor());
            });
            services.AddScoped<IUserPrincipalService, UserPrincipalService>();
            //services.AddScoped<IClientHelper, ClientHelper>(); // chưa cần thiết
            services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

            //auto mapper
            services.AddAutoMapper(typeof(MappingProfile));
            //services.AddScoped<IMapper,Mapper>();
            
            
        }
    }
}
