using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace MyApp.Infrastructure.Configs
{
    public static class ServicesExtention
    {
        public static void ServerConfig(this IServiceCollection services, IConfiguration Configuration)
        {
            services.AddHttpContextAccessor();
            services.AddMemoryCache();
            services.AddOptions();
            //swagger config
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            //ServiceInfo.Token = Configuration.GetValue<string>("ServiceToken", "token");

            //services.AddSingleton<IMongoClient>(sp => new MongoClient(Configuration.GetValue<string>("MongoDbSettings:ConnectionString")));

            var connectString = Configuration.GetConnectionString("Default") ?? string.Empty;

            services.DIContext(connectString);
            services.DIServices(connectString);
            //services.AddSingleton<IDapperContext>(provider => new DapperContext(connectString));
            services.AddCors();
            //config authen

            var jwtSettings = Configuration.GetSection("Jwt");
            var key = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT key not configured");

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {   
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Append("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            //config swagger
            services.AddSwaggerGen(options =>
             {
                 options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                 {
                     Title = "My API",
                     Version = "v1",
                     Description = "HungSilver .net",
                     Contact = new Microsoft.OpenApi.Models.OpenApiContact
                     {
                         Name = "HungSilver",
                         Email = "hungsilvertq@gmail.com"
                     }
                 });
                 var securityScheme = new OpenApiSecurityScheme
                 {
                     Name = "Authorization",
                     Description = "Enter JWT Bearer token **only**",
                     In = ParameterLocation.Header,
                     Type = SecuritySchemeType.Http,
                     Scheme = "bearer",
                     BearerFormat = "JWT",
                     Reference = new OpenApiReference
                     {
                         Type = ReferenceType.SecurityScheme,
                         Id = "Bearer"
                     }
                 };

                 options.AddSecurityDefinition("Bearer", securityScheme);

                 // Áp dụng cho tất cả endpoint: thêm requirement
                 var securityRequirement = new OpenApiSecurityRequirement
                 {
                    { securityScheme, Array.Empty<string>() }
                 };
                 options.AddSecurityRequirement(securityRequirement);
             });
        }
    }
}
