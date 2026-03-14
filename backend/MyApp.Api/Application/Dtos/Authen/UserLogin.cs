namespace MyApp.Application.DTOs.Authen
{
    public class UserLogin
    {
        public Guid Id { get; set; }
        public string? DisplayName { get; set; }
        public string? UserName { get; set; }
        public string Email { get; set; } = null!;
        public bool IsAdmin { get; set; }
        public bool IsUser { get; set; }
        public string? Token { get; set; } = null!;
        /// <summary>
        /// Đơn vị hiện tại của người dùng
        /// </summary>
        public Guid DonViId { get; set; }
        public string? TenDonVi { get; set; }
        public Guid IdChiNhanh { get; set; }
        public string? AvatarUrl { get; set; }
        public List<string>? RoleCodes { get; set; }
        public bool? IsLockedOut { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
