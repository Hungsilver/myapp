using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities
{
    public class User : BaseEntity
    {
        public Guid? IdDonVi { get; set; }
        public Guid? IdChiNhanh { get; set; }

        [StringLength(20)]
        public string? Code { get; set; }

        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [StringLength(60)]
        public string? Fullname { get; set; }

        [StringLength(500)]
        public string? PasswordHash { get; set; }

        [StringLength(500)]
        public string? AvartarUrl { get; set; }

        [StringLength(15)]
        public string? PhoneNumber { get; set; }

        [StringLength(12)]
        public string? Cmnd { get; set; }

        public int? Gender { get; set; }

        [StringLength(50)]
        public string Email { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Address { get; set; }

        public DateTime? BirthDate { get; set; }

        [StringLength(500)]
        public string? ListRole { get; set; }

        public bool IsAdmin { get; set; }
        public bool IsUser { get; set; } = true;
    }
}
