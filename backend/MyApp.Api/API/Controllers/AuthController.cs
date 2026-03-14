using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Application.DTOs.Authen;
using MyApp.Application.Services.Auth;
using MyApp.API.Controllers;

namespace MyApp.Api.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return ResponseResult(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.LoginAsync(request, ipAddress);
        return ResponseResult(result);
    }

    [HttpPost("login-google")]
    public async Task<IActionResult> LoginGoogle([FromBody] GoogleLoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.LoginGoogleAsync(request, ipAddress);
        return ResponseResult(result);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress);
        return ResponseResult(result);
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var result = await _authService.RevokeTokenAsync(request.RefreshToken, ipAddress);
        return ResponseResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        if (CurrentLogin == null)
            return Unauthorized();
        var result = await _authService.GetCurrentUser(CurrentLogin);
        return ResponseResult(result);
    }

    [Authorize]
    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request)
    {
        if (CurrentLogin == null)
            return Unauthorized();
        var result = await _authService.UpdateUserAsync(CurrentLogin.Id, request);
        return ResponseResult(result);
    }
}
