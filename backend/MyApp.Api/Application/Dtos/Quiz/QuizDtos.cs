namespace MyApp.Api.Application.Dtos.Quiz;

// ── CATEGORY ─────────────────────────────────────────────
public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1";
}

// ── QUESTION ──────────────────────────────────────────────
public class QuestionResponse
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? MainImg { get; set; }
    public string? Audio { get; set; }
    public string AnsL { get; set; } = string.Empty;
    public string AnsR { get; set; } = string.Empty;
    public string? ImgL { get; set; }
    public string? ImgR { get; set; }
    public string CorrectSide { get; set; } = "L";
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Difficulty { get; set; } = "medium";
    public int Points { get; set; }
    public string? Explanation { get; set; }
    public int TimesShown { get; set; }
    public int TimesCorrect { get; set; }
    public double? AccuracyPct { get; set; }
    public DateTime? CreatedDate { get; set; }
}

public class CreateQuestionRequest
{
    public string Text { get; set; } = string.Empty;
    public string? MainImg { get; set; }
    public string? Audio { get; set; }
    public string AnsL { get; set; } = string.Empty;
    public string AnsR { get; set; } = string.Empty;
    public string? ImgL { get; set; }
    public string? ImgR { get; set; }
    public string CorrectSide { get; set; } = "L";
    public Guid? CategoryId { get; set; }
    public string Difficulty { get; set; } = "medium";
    public int Points { get; set; } = 200;
    public string? Explanation { get; set; }
}

public class UpdateQuestionRequest
{
    public string? Text { get; set; }
    public string? MainImg { get; set; }
    public string? Audio { get; set; }
    public string? AnsL { get; set; }
    public string? AnsR { get; set; }
    public string? ImgL { get; set; }
    public string? ImgR { get; set; }
    public string? CorrectSide { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Difficulty { get; set; }
    public int? Points { get; set; }
    public string? Explanation { get; set; }
}

public class BulkDeleteRequest
{
    public List<Guid> Ids { get; set; } = new();
}

public class QuestionFilterRequest
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Difficulty { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// ── GAME ──────────────────────────────────────────────────
public class GameSummaryResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool ShufQ { get; set; }
    public bool ShufA { get; set; }
    public bool BonusTime { get; set; }
    public bool StreakBonus { get; set; }
    public int WrongPenalty { get; set; }
    public int QuestionCount { get; set; }
    public int MaxScore { get; set; }
    public int PlayCount { get; set; }
    public LeaderboardEntryResponse? TopRecord { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class GameDetailResponse : GameSummaryResponse
{
    public List<QuestionResponse> Questions { get; set; } = new();
}

public class CreateGameRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool ShufQ { get; set; }
    public bool ShufA { get; set; }
    public bool BonusTime { get; set; } = true;
    public bool StreakBonus { get; set; } = true;
    public int WrongPenalty { get; set; }
    public List<GameQuestionItem> Questions { get; set; } = new();

    // Inline questions to create & add (optional)
    public List<CreateQuestionRequest> InlineQuestions { get; set; } = new();
}

public class UpdateGameRequest : CreateGameRequest { }

public class GameQuestionItem
{
    public Guid QuestionId { get; set; }
    public int Order { get; set; }
}

// ── SESSION ───────────────────────────────────────────────
public class SaveSessionRequest
{
    public Guid GameId { get; set; }
    public string PlayerName { get; set; } = "Guest";
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int StreakMax { get; set; }
    public int TotalTimeSeconds { get; set; }
    public List<SessionDetailItem> Details { get; set; } = new();
}

public class SessionDetailItem
{
    public Guid QuestionId { get; set; }
    public bool IsCorrect { get; set; }
    public int TimeTakenMs { get; set; }
    public int EarnedPoints { get; set; }
    public string ChosenSide { get; set; } = "L";
}

public class LeaderboardEntryResponse
{
    public int Rank { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int StreakMax { get; set; }
    public int TotalTimeSeconds { get; set; }
    public DateTime? PlayedAt { get; set; }
}

// ── STATS ────────────────────────────────────────────────
public class QuizStatsOverview
{
    public int TotalGames { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalSessions { get; set; }
    public int TotalAnswered { get; set; }
    public double OverallAccuracy { get; set; }
}
