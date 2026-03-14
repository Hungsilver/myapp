using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Application.Dtos.Quiz;
using MyApp.Api.Application.Services;

namespace MyApp.API.Controllers;

[Route("api/quiz")]
public class QuizController : BaseController
{
    private readonly IQuizService _quiz;

    public QuizController(IQuizService quiz)
    {
        _quiz = quiz;
    }

    // ── CATEGORIES ────────────────────────────────────────────────────────────
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
        => ResponseResult(await _quiz.GetCategoriesAsync());

    [HttpPost("categories")]
    [Authorize]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest req)
        => ResponseResult(await _quiz.CreateCategoryAsync(req, CurrentLogin?.UserName ?? "system"));

    [HttpDelete("categories/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteCategory(Guid id)
        => ResponseResult(await _quiz.DeleteCategoryAsync(id));

    // ── QUESTIONS ─────────────────────────────────────────────────────────────
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions([FromQuery] QuestionFilterRequest filter)
        => ResponseResult(await _quiz.GetQuestionsAsync(filter));

    [HttpGet("questions/stats")]
    public async Task<IActionResult> GetQuestionsWithStats()
        => ResponseResult(await _quiz.GetQuestionsWithStatsAsync());

    [HttpGet("questions/{id:guid}")]
    public async Task<IActionResult> GetQuestion(Guid id)
        => ResponseResult(await _quiz.GetQuestionByIdAsync(id));

    [HttpPost("questions")]
    [Authorize]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionRequest req)
        => ResponseResult(await _quiz.CreateQuestionAsync(req, CurrentLogin?.UserName ?? "system"));

    [HttpPut("questions/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] UpdateQuestionRequest req)
        => ResponseResult(await _quiz.UpdateQuestionAsync(id, req, CurrentLogin?.UserName ?? "system"));

    [HttpDelete("questions/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteQuestion(Guid id)
        => ResponseResult(await _quiz.DeleteQuestionAsync(id));

    [HttpPost("questions/bulk-delete")]
    [Authorize]
    public async Task<IActionResult> BulkDeleteQuestions([FromBody] BulkDeleteRequest req)
        => ResponseResult(await _quiz.BulkDeleteQuestionsAsync(req));

    // ── GAMES ─────────────────────────────────────────────────────────────────
    [HttpGet("games")]
    public async Task<IActionResult> GetGames()
        => ResponseResult(await _quiz.GetGamesAsync());

    [HttpGet("games/{id:guid}")]
    public async Task<IActionResult> GetGame(Guid id)
        => ResponseResult(await _quiz.GetGameDetailAsync(id));

    [HttpPost("games")]
    [Authorize]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest req)
        => ResponseResult(await _quiz.CreateGameAsync(req, CurrentLogin?.UserName ?? "system", CurrentLogin?.Id));

    [HttpPut("games/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateGame(Guid id, [FromBody] UpdateGameRequest req)
        => ResponseResult(await _quiz.UpdateGameAsync(id, req, CurrentLogin?.UserName ?? "system"));

    [HttpDelete("games/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteGame(Guid id)
        => ResponseResult(await _quiz.DeleteGameAsync(id));

    // ── SESSIONS ──────────────────────────────────────────────────────────────
    [HttpPost("sessions")]
    public async Task<IActionResult> SaveSession([FromBody] SaveSessionRequest req)
        => ResponseResult(await _quiz.SaveSessionAsync(req));

    [HttpGet("sessions/leaderboard/{gameId:guid}")]
    public async Task<IActionResult> GetLeaderboard(Guid gameId, [FromQuery] int top = 10)
        => ResponseResult(await _quiz.GetLeaderboardAsync(gameId, top));

    // ── STATS ─────────────────────────────────────────────────────────────────
    [HttpGet("stats/overview")]
    public async Task<IActionResult> GetStatsOverview()
        => ResponseResult(await _quiz.GetStatsOverviewAsync());
}
