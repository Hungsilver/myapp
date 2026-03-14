using BCrypt.Net;
using MyApp.Application.Common;
using MyApp.Application.DTOs.Authen;
using MyApp.Infrastructure.Repositories;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Domain.Entities;

namespace MyApp.Application.Services.Auth
{
    public interface IAuthService
    {
        Task<IMethodResult<LoginResponse>> LoginAsync(LoginRequest request, string ipAddress);
        Task<IMethodResult<LoginResponse>> LoginGoogleAsync(GoogleLoginRequest request, string ipAddress);
        Task<IMethodResult<LoginResponse>> RefreshTokenAsync(string refreshToken, string ipAddress);
        Task<IMethodResult<bool>> RevokeTokenAsync(string refreshToken, string ipAddress);
        Task<IMethodResult<User>> RegisterAsync(RegisterRequest request);
        Task<IMethodResult<UserLogin>> GetCurrentUser(UserLogin userLogin);
        Task<IMethodResult<UserLogin>> UpdateUserAsync(Guid userId, UpdateUserRequest request);
    }

    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepo;
        private readonly IRepository<Role> _roleRepo;
        private readonly IRepository<RefreshToken> _refreshTokenRepo;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;

        public AuthService(
            IRepository<User> userRepo,
            IRepository<Role> roleRepo,
            IJwtTokenService jwtTokenService,
            IConfiguration configuration,
            IRepository<RefreshToken> refreshTokenRepo)
        {
            _userRepo = userRepo;
            _roleRepo = roleRepo;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
            _refreshTokenRepo = refreshTokenRepo;
        }

        public async Task<IMethodResult<LoginResponse>> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await _userRepo.TableWithNoLock()
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            if (user == null)
                return MethodResult<LoginResponse>.ResultWithError("Sai email hoặc mật khẩu");

            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return MethodResult<LoginResponse>.ResultWithError("Sai email hoặc mật khẩu");

            var roles = ParseRoles(user.ListRole);
            var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

            await RevokeAllUserTokensAsync(user.Id);
            await SaveRefreshTokenAsync(user.Id, newRefreshToken, ipAddress);

            var expirationDate = GetAccessTokenExpiration();
            return MethodResult<LoginResponse>.ResultWithData(
                new LoginResponse(user.Id, user.Email, user.Username, newAccessToken, newRefreshToken, expirationDate));
        }

        public async Task<IMethodResult<LoginResponse>> RefreshTokenAsync(string refreshToken, string ipAddress)
        {
            var tokenEntity = await _refreshTokenRepo.TableWithNoLock()
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenEntity == null)
                return MethodResult<LoginResponse>.ResultWithError("Refresh token không hợp lệ", status: 401);

            if (tokenEntity.ExpirationDate < DateTime.UtcNow)
                return MethodResult<LoginResponse>.ResultWithError("Refresh token đã hết hạn", status: 401);

            var user = await _userRepo.GetByIdAsync(tokenEntity.IdUser);
            if (user == null)
                return MethodResult<LoginResponse>.ResultWithError("Người dùng không tồn tại", status: 401);

            // Rotate token: revoke cũ, tạo mới
            tokenEntity.IsDelete = true;
            tokenEntity.MarkDirty(nameof(tokenEntity.IsDelete));
            await _refreshTokenRepo.UpdateAsync(tokenEntity);

            var roles = ParseRoles(user.ListRole);
            var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

            var newTokenEntity = new RefreshToken
            {
                Token = newRefreshToken,
                IdUser = user.Id,
                ExpirationDate = tokenEntity.ExpirationDate, // giữ nguyên thời hạn gốc
                CreatedByIp = ipAddress
            };
            await _refreshTokenRepo.InsertAsync(newTokenEntity);

            var expirationDate = GetAccessTokenExpiration();
            return MethodResult<LoginResponse>.ResultWithData(
                new LoginResponse(user.Id, user.Email, user.Username, newAccessToken, newRefreshToken, expirationDate));
        }

        public async Task<IMethodResult<bool>> RevokeTokenAsync(string refreshToken, string ipAddress)
        {
            var tokenEntity = await _refreshTokenRepo.TableWithNoLock()
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenEntity == null)
                return MethodResult<bool>.ResultWithError("Refresh token không hợp lệ");

            tokenEntity.IsDelete = true;
            tokenEntity.MarkDirty(nameof(tokenEntity.IsDelete));
            await _refreshTokenRepo.UpdateAsync(tokenEntity);

            return MethodResult<bool>.ResultWithData(true);
        }

        public async Task<IMethodResult<User>> RegisterAsync(RegisterRequest req)
        {
            var userExists = await _userRepo.TableWithNoLock()
                .AnyAsync(x => x.Email == req.Email);

            if (userExists)
                return MethodResult<User>.ResultWithError("Email đã tồn tại");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = req.Username ?? string.Empty,
                Fullname = req.Fullname,
                PhoneNumber = req.PhoneNumber,
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                ListRole = "User",
                IsUser = true,
                IsAdmin = false
            };

            await _userRepo.InsertAsync(user);
            return MethodResult<User>.ResultWithData(user);
        }

        public async Task<IMethodResult<UserLogin>> GetCurrentUser(UserLogin userLogin)
        {
            var user = await _userRepo.TableWithNoLock()
                .FirstOrDefaultAsync(x => x.Email == userLogin.Email);

            if (user == null)
                return MethodResult<UserLogin>.ResultWithError("Không lấy được thông tin người dùng");

            userLogin.UserName = user.Username;
            userLogin.DisplayName = user.Fullname;
            userLogin.PhoneNumber = user.PhoneNumber;
            userLogin.AvatarUrl = user.AvartarUrl;
            userLogin.IsAdmin = user.IsAdmin;
            userLogin.IsUser = user.IsUser;
            userLogin.RoleCodes = ParseRoles(user.ListRole);
            userLogin.IsLockedOut = false;
            userLogin.Token = null;

            return MethodResult<UserLogin>.ResultWithData(userLogin);
        }

        public async Task<IMethodResult<UserLogin>> UpdateUserAsync(Guid userId, UpdateUserRequest request)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return MethodResult<UserLogin>.ResultWithError("Không tìm thấy người dùng", status: 404);

            if (request.Username != null) { user.Username = request.Username; user.MarkDirty(nameof(user.Username)); }
            if (request.Fullname != null) { user.Fullname = request.Fullname; user.MarkDirty(nameof(user.Fullname)); }
            if (request.PhoneNumber != null) { user.PhoneNumber = request.PhoneNumber; user.MarkDirty(nameof(user.PhoneNumber)); }
            if (request.Address != null) { user.Address = request.Address; user.MarkDirty(nameof(user.Address)); }
            if (request.AvatarUrl != null) { user.AvartarUrl = request.AvatarUrl; user.MarkDirty(nameof(user.AvartarUrl)); }
            if (request.Gender != null) { user.Gender = request.Gender; user.MarkDirty(nameof(user.Gender)); }
            if (request.BirthDate != null) { user.BirthDate = request.BirthDate; user.MarkDirty(nameof(user.BirthDate)); }

            await _userRepo.UpdateAsync(user);

            var userLogin = new UserLogin
            {
                Id = user.Id,
                UserName = user.Username,
                DisplayName = user.Fullname,
                Email = user.Email,
                IsAdmin = user.IsAdmin,
                IsUser = user.IsUser,
                AvatarUrl = user.AvartarUrl,
                PhoneNumber = user.PhoneNumber,
                RoleCodes = ParseRoles(user.ListRole)
            };

            return MethodResult<UserLogin>.ResultWithData(userLogin);
        }

        public async Task<IMethodResult<LoginResponse>> LoginGoogleAsync(GoogleLoginRequest request, string ipAddress)
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            }
            catch
            {
                return MethodResult<LoginResponse>.ResultWithError("Lỗi xác thực với Google");
            }

            if (payload?.Email == null)
                return MethodResult<LoginResponse>.ResultWithError("Lỗi xác thực với Google");

            var user = await _userRepo.TableWithNoLock()
                .FirstOrDefaultAsync(x => x.Email == payload.Email);

            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = payload.Email.Split('@')[0],
                    Fullname = payload.Name,
                    Email = payload.Email,
                    PasswordHash = null,
                    ListRole = "User",
                    IsUser = true,
                    IsAdmin = false
                };
                await _userRepo.InsertAsync(user);
            }

            var roles = ParseRoles(user.ListRole);
            var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

            await RevokeAllUserTokensAsync(user.Id);
            await SaveRefreshTokenAsync(user.Id, newRefreshToken, ipAddress);

            var expirationDate = GetAccessTokenExpiration();
            return MethodResult<LoginResponse>.ResultWithData(
                new LoginResponse(user.Id, user.Email, user.Username, newAccessToken, newRefreshToken, expirationDate));
        }

        // ─── Helpers ────────────────────────────────────────────────────────────

        private static List<string> ParseRoles(string? listRole)
            => string.IsNullOrWhiteSpace(listRole)
                ? new List<string>()
                : listRole.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();

        private DateTime GetAccessTokenExpiration()
        {
            var minutes = Convert.ToInt32(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60");
            return DateTime.Now.AddMinutes(minutes);
        }

        private async Task RevokeAllUserTokensAsync(Guid userId)
        {
            var tokens = await _refreshTokenRepo.TableWithNoLock()
                .Where(x => x.IdUser == userId)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsDelete = true;
                token.MarkDirty(nameof(token.IsDelete));
                await _refreshTokenRepo.UpdateAsync(token);
            }
        }

        private async Task SaveRefreshTokenAsync(Guid userId, string token, string ipAddress)
        {
            var days = Convert.ToDouble(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
            var entity = new RefreshToken
            {
                Token = token,
                IdUser = userId,
                ExpirationDate = DateTime.UtcNow.AddDays(days),
                CreatedByIp = ipAddress
            };
            await _refreshTokenRepo.InsertAsync(entity);
        }
    }
}
