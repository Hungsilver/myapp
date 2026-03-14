namespace MyApp.Api.Domain.Entities.Quiz;

public class GameQuestion : BaseEntity
{
    public Guid GameId { get; set; }
    public QuizGame Game { get; set; } = null!;

    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public int Order { get; set; }
}
