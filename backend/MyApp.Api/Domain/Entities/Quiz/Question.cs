using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities.Quiz;

public class Question : BaseEntity
{
    public string Text { get; set; } = string.Empty;

    // Base64 or URL — nvarchar(max)
    public string? MainImg { get; set; }
    public string? Audio { get; set; }

    [StringLength(500)]
    public string AnsL { get; set; } = string.Empty;

    [StringLength(500)]
    public string AnsR { get; set; } = string.Empty;

    public string? ImgL { get; set; }
    public string? ImgR { get; set; }

    [StringLength(1)]
    public string CorrectSide { get; set; } = "L";

    public Guid? CategoryId { get; set; }
    public QuestionCategory? Category { get; set; }

    [StringLength(10)]
    public string Difficulty { get; set; } = "medium"; // easy | medium | hard

    public int Points { get; set; } = 200;
    public string? Explanation { get; set; }

    // Cumulative stats (updated when session saved)
    public int TimesShown { get; set; } = 0;
    public int TimesCorrect { get; set; } = 0;
    public long TotalTimeTakenMs { get; set; } = 0;

    public ICollection<GameQuestion> GameQuestions { get; set; } = new List<GameQuestion>();
}
