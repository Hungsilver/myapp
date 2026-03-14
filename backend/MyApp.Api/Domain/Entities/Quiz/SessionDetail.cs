using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Domain.Entities.Quiz;

public class SessionDetail : BaseEntity
{
    public Guid SessionId { get; set; }
    public GameSession Session { get; set; } = null!;

    public Guid QuestionId { get; set; }

    public bool IsCorrect { get; set; }
    public int TimeTakenMs { get; set; }
    public int EarnedPoints { get; set; }

    [StringLength(1)]
    public string ChosenSide { get; set; } = "L";
}
