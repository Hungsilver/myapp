using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities.Quiz;

public class GameSession : BaseEntity
{
    public Guid GameId { get; set; }
    public QuizGame Game { get; set; } = null!;

    [StringLength(100)]
    public string PlayerName { get; set; } = "Guest";

    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int StreakMax { get; set; }
    public int TotalTimeSeconds { get; set; }

    public ICollection<SessionDetail> Details { get; set; } = new List<SessionDetail>();
}
