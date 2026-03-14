using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities.Quiz;

public class QuizGame : BaseEntity
{
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool ShufQ { get; set; } = false;
    public bool ShufA { get; set; } = false;
    public bool BonusTime { get; set; } = true;
    public bool StreakBonus { get; set; } = true;
    public int WrongPenalty { get; set; } = 0;

    public Guid? CreatedById { get; set; }

    public ICollection<GameQuestion> GameQuestions { get; set; } = new List<GameQuestion>();
    public ICollection<GameSession> Sessions { get; set; } = new List<GameSession>();
}
