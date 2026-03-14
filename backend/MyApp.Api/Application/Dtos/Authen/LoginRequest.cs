namespace MyApp.Application.DTOs.Authen
{
    public record LoginRequest(string Email, string Password);
    public record LoginResponse(
        Guid Iduser,
        string Email,
        string Username,
        string AccessToken,
        string? RefreshToken,
        DateTime ExpirationDate
    );

    public record RefreshTokenRequest(string RefreshToken);

    public record RegisterRequest(
        string Email,
        string Password,
        string? Username,
        string? Fullname,
        string? PhoneNumber
    );

    public class UpdateUserRequest
    {
        public string? Username { get; set; }
        public string? Fullname { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public int? Gender { get; set; }
        public DateTime? BirthDate { get; set; }
    }
}
