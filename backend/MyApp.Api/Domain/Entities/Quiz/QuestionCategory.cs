using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities.Quiz;

public class QuestionCategory : BaseEntity
{
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(20)]
    public string Color { get; set; } = "#6366f1";

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
