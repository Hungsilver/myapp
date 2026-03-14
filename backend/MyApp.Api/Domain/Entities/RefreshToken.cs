namespace MyApp.Api.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public Guid IdUser { get; set; }
        public string? Token { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string CreatedByIp { get; set; } = string.Empty;
    }
}
