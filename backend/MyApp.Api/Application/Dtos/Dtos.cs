namespace MyApp.Api.Application.Dtos;

// Auth
public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string FullName, string Email, string Role);

// Product
public record ProductDto(Guid Id, string Name, string Description, decimal Price, int Stock, string Category, string ImageUrl, DateTime? CreatedAt);
public record CreateProductDto(string Name, string Description, decimal Price, int Stock, string Category, string ImageUrl);
public record UpdateProductDto(string Name, string Description, decimal Price, int Stock, string Category, string ImageUrl);

// Common
public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);
public record ApiResponse<T>(bool Success, string Message, T? Data);
