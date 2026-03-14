using MyApp.Api.Application.Dtos.Quiz;
using MyApp.Application.Common;

namespace MyApp.Api.Application.Services;

public interface IQuizService
{
    // Category
    Task<IMethodResult<List<CategoryResponse>>> GetCategoriesAsync();
    Task<IMethodResult<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest req, string userName);
    Task<IMethodResult<bool>> DeleteCategoryAsync(Guid id);

    // Question
    Task<IMethodResult<List<QuestionResponse>>> GetQuestionsAsync(QuestionFilterRequest filter);
    Task<IMethodResult<QuestionResponse>> GetQuestionByIdAsync(Guid id);
    Task<IMethodResult<QuestionResponse>> CreateQuestionAsync(CreateQuestionRequest req, string userName);
    Task<IMethodResult<QuestionResponse>> UpdateQuestionAsync(Guid id, UpdateQuestionRequest req, string userName);
    Task<IMethodResult<bool>> DeleteQuestionAsync(Guid id);
    Task<IMethodResult<int>> BulkDeleteQuestionsAsync(BulkDeleteRequest req);

    // Game
    Task<IMethodResult<List<GameSummaryResponse>>> GetGamesAsync();
    Task<IMethodResult<GameDetailResponse>> GetGameDetailAsync(Guid id);
    Task<IMethodResult<GameSummaryResponse>> CreateGameAsync(CreateGameRequest req, string userName, Guid? userId);
    Task<IMethodResult<GameSummaryResponse>> UpdateGameAsync(Guid id, UpdateGameRequest req, string userName);
    Task<IMethodResult<bool>> DeleteGameAsync(Guid id);

    // Session
    Task<IMethodResult<LeaderboardEntryResponse>> SaveSessionAsync(SaveSessionRequest req);
    Task<IMethodResult<List<LeaderboardEntryResponse>>> GetLeaderboardAsync(Guid gameId, int top = 10);

    // Stats
    Task<IMethodResult<QuizStatsOverview>> GetStatsOverviewAsync();
    Task<IMethodResult<List<QuestionResponse>>> GetQuestionsWithStatsAsync();
}
