using Microsoft.EntityFrameworkCore;
using MyApp.Api.Application.Dtos.Quiz;
using MyApp.Api.Domain.Entities.Quiz;
using MyApp.Api.Infrastructure.Data;
using MyApp.Application.Common;

namespace MyApp.Api.Application.Services;

public class QuizService : IQuizService
{
    private readonly AppDbContext _db;

    public QuizService(AppDbContext db)
    {
        _db = db;
    }

    // ── CATEGORIES ───────────────────────────────────────────────────────────
    public async Task<IMethodResult<List<CategoryResponse>>> GetCategoriesAsync()
    {
        var cats = await _db.QuestionCategories
            .Where(c => !c.IsDelete)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Color = c.Color,
                QuestionCount = c.Questions.Count(q => !q.IsDelete)
            })
            .ToListAsync();
        return MethodResult<List<CategoryResponse>>.ResultWithData(cats, totalRecord: cats.Count);
    }

    public async Task<IMethodResult<CategoryResponse>> CreateCategoryAsync(CreateCategoryRequest req, string userName)
    {
        if (await _db.QuestionCategories.AnyAsync(c => c.Name == req.Name && !c.IsDelete))
            return MethodResult<CategoryResponse>.ResultWithError("Tên danh mục đã tồn tại", status: 409);

        var entity = new QuestionCategory
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Color = req.Color,
            CreatedDate = DateTime.UtcNow,
            CreatedUserName = userName
        };
        _db.QuestionCategories.Add(entity);
        await _db.SaveChangesAsync();
        return MethodResult<CategoryResponse>.ResultWithData(new CategoryResponse { Id = entity.Id, Name = entity.Name, Color = entity.Color });
    }

    public async Task<IMethodResult<bool>> DeleteCategoryAsync(Guid id)
    {
        var entity = await _db.QuestionCategories.FindAsync(id);
        if (entity == null) return MethodResult<bool>.ResultWithError("Không tìm thấy", status: 404);
        entity.IsDelete = true;
        await _db.SaveChangesAsync();
        return MethodResult<bool>.ResultWithData(true);
    }

    // ── QUESTIONS ─────────────────────────────────────────────────────────────
    public async Task<IMethodResult<List<QuestionResponse>>> GetQuestionsAsync(QuestionFilterRequest filter)
    {
        var query = _db.Questions
            .Include(q => q.Category)
            .Where(q => !q.IsDelete)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(q => q.Text.Contains(filter.Search) || q.AnsL.Contains(filter.Search) || q.AnsR.Contains(filter.Search));
        if (filter.CategoryId.HasValue)
            query = query.Where(q => q.CategoryId == filter.CategoryId.Value);
        if (!string.IsNullOrWhiteSpace(filter.Difficulty))
            query = query.Where(q => q.Difficulty == filter.Difficulty);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(q => q.CreatedDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(q => MapQuestion(q))
            .ToListAsync();

        return MethodResult<List<QuestionResponse>>.ResultWithData(items, totalRecord: total);
    }

    public async Task<IMethodResult<QuestionResponse>> GetQuestionByIdAsync(Guid id)
    {
        var q = await _db.Questions.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id && !x.IsDelete);
        if (q == null) return MethodResult<QuestionResponse>.ResultWithError("Không tìm thấy câu hỏi", status: 404);
        return MethodResult<QuestionResponse>.ResultWithData(MapQuestion(q));
    }

    public async Task<IMethodResult<QuestionResponse>> CreateQuestionAsync(CreateQuestionRequest req, string userName)
    {
        var entity = new Question
        {
            Id = Guid.NewGuid(),
            Text = req.Text,
            MainImg = req.MainImg,
            Audio = req.Audio,
            AnsL = req.AnsL,
            AnsR = req.AnsR,
            ImgL = req.ImgL,
            ImgR = req.ImgR,
            CorrectSide = req.CorrectSide,
            CategoryId = req.CategoryId,
            Difficulty = req.Difficulty,
            Points = req.Points,
            Explanation = req.Explanation,
            CreatedDate = DateTime.UtcNow,
            CreatedUserName = userName
        };
        _db.Questions.Add(entity);
        await _db.SaveChangesAsync();
        await _db.Entry(entity).Reference(e => e.Category).LoadAsync();
        return MethodResult<QuestionResponse>.ResultWithData(MapQuestion(entity));
    }

    public async Task<IMethodResult<QuestionResponse>> UpdateQuestionAsync(Guid id, UpdateQuestionRequest req, string userName)
    {
        var entity = await _db.Questions.Include(q => q.Category).FirstOrDefaultAsync(q => q.Id == id && !q.IsDelete);
        if (entity == null) return MethodResult<QuestionResponse>.ResultWithError("Không tìm thấy", status: 404);

        if (req.Text != null) entity.Text = req.Text;
        if (req.AnsL != null) entity.AnsL = req.AnsL;
        if (req.AnsR != null) entity.AnsR = req.AnsR;
        if (req.CorrectSide != null) entity.CorrectSide = req.CorrectSide;
        if (req.Difficulty != null) entity.Difficulty = req.Difficulty;
        if (req.Points.HasValue) entity.Points = req.Points.Value;
        if (req.CategoryId.HasValue) entity.CategoryId = req.CategoryId.Value;
        if (req.Explanation != null) entity.Explanation = req.Explanation;

        // Allow explicit null clear for media
        entity.MainImg = req.MainImg;
        entity.Audio = req.Audio;
        entity.ImgL = req.ImgL;
        entity.ImgR = req.ImgR;

        entity.UpdatedDate = DateTime.UtcNow;
        entity.UpdatedUserName = userName;
        await _db.SaveChangesAsync();
        await _db.Entry(entity).Reference(e => e.Category).LoadAsync();
        return MethodResult<QuestionResponse>.ResultWithData(MapQuestion(entity));
    }

    public async Task<IMethodResult<bool>> DeleteQuestionAsync(Guid id)
    {
        var entity = await _db.Questions.FindAsync(id);
        if (entity == null) return MethodResult<bool>.ResultWithError("Không tìm thấy", status: 404);
        entity.IsDelete = true;
        await _db.SaveChangesAsync();
        return MethodResult<bool>.ResultWithData(true);
    }

    public async Task<IMethodResult<int>> BulkDeleteQuestionsAsync(BulkDeleteRequest req)
    {
        var entities = await _db.Questions.Where(q => req.Ids.Contains(q.Id) && !q.IsDelete).ToListAsync();
        foreach (var e in entities) e.IsDelete = true;
        await _db.SaveChangesAsync();
        return MethodResult<int>.ResultWithData(entities.Count);
    }

    // ── GAMES ─────────────────────────────────────────────────────────────────
    public async Task<IMethodResult<List<GameSummaryResponse>>> GetGamesAsync()
    {
        var games = await _db.QuizGames
            .Where(g => !g.IsDelete)
            .Include(g => g.GameQuestions).ThenInclude(gq => gq.Question)
            .Include(g => g.Sessions)
            .OrderByDescending(g => g.UpdatedDate ?? g.CreatedDate)
            .ToListAsync();

        var result = games.Select(g => ToGameSummary(g)).ToList();
        return MethodResult<List<GameSummaryResponse>>.ResultWithData(result, totalRecord: result.Count);
    }

    public async Task<IMethodResult<GameDetailResponse>> GetGameDetailAsync(Guid id)
    {
        var g = await _db.QuizGames
            .Where(x => x.Id == id && !x.IsDelete)
            .Include(x => x.GameQuestions.Where(gq => !gq.IsDelete))
                .ThenInclude(gq => gq.Question)
                    .ThenInclude(q => q.Category)
            .Include(x => x.Sessions)
            .FirstOrDefaultAsync();

        if (g == null) return MethodResult<GameDetailResponse>.ResultWithError("Không tìm thấy game", status: 404);

        var summary = ToGameSummary(g);
        var detail = new GameDetailResponse
        {
            Id = summary.Id, Title = summary.Title, Description = summary.Description,
            ShufQ = summary.ShufQ, ShufA = summary.ShufA, BonusTime = summary.BonusTime,
            StreakBonus = summary.StreakBonus, WrongPenalty = summary.WrongPenalty,
            QuestionCount = summary.QuestionCount, MaxScore = summary.MaxScore,
            PlayCount = summary.PlayCount, TopRecord = summary.TopRecord, UpdatedDate = summary.UpdatedDate,
            Questions = g.GameQuestions
                .Where(gq => !gq.IsDelete && !gq.Question.IsDelete)
                .OrderBy(gq => gq.Order)
                .Select(gq => MapQuestion(gq.Question))
                .ToList()
        };
        return MethodResult<GameDetailResponse>.ResultWithData(detail);
    }

    public async Task<IMethodResult<GameSummaryResponse>> CreateGameAsync(CreateGameRequest req, string userName, Guid? userId)
    {
        if (await _db.QuizGames.AnyAsync(g => g.Title == req.Title && !g.IsDelete))
            return MethodResult<GameSummaryResponse>.ResultWithError("Tên game đã tồn tại", status: 409);

        var game = new QuizGame
        {
            Id = Guid.NewGuid(),
            Title = req.Title,
            Description = req.Description,
            ShufQ = req.ShufQ,
            ShufA = req.ShufA,
            BonusTime = req.BonusTime,
            StreakBonus = req.StreakBonus,
            WrongPenalty = req.WrongPenalty,
            CreatedById = userId,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            CreatedUserName = userName
        };
        _db.QuizGames.Add(game);

        // Add inline questions to bank first
        int order = 0;
        foreach (var iq in req.InlineQuestions)
        {
            var q = new Question
            {
                Id = Guid.NewGuid(),
                Text = iq.Text, MainImg = iq.MainImg, Audio = iq.Audio,
                AnsL = iq.AnsL, AnsR = iq.AnsR, ImgL = iq.ImgL, ImgR = iq.ImgR,
                CorrectSide = iq.CorrectSide, CategoryId = iq.CategoryId,
                Difficulty = iq.Difficulty, Points = iq.Points, Explanation = iq.Explanation,
                CreatedDate = DateTime.UtcNow, CreatedUserName = userName
            };
            _db.Questions.Add(q);
            _db.GameQuestions.Add(new GameQuestion { Id = Guid.NewGuid(), GameId = game.Id, QuestionId = q.Id, Order = order++, CreatedDate = DateTime.UtcNow });
        }

        // Link existing questions
        foreach (var item in req.Questions)
        {
            _db.GameQuestions.Add(new GameQuestion
            {
                Id = Guid.NewGuid(), GameId = game.Id,
                QuestionId = item.QuestionId, Order = item.Order,
                CreatedDate = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        var created = await _db.QuizGames
            .Include(g => g.GameQuestions).ThenInclude(gq => gq.Question)
            .Include(g => g.Sessions)
            .FirstAsync(g => g.Id == game.Id);
        return MethodResult<GameSummaryResponse>.ResultWithData(ToGameSummary(created));
    }

    public async Task<IMethodResult<GameSummaryResponse>> UpdateGameAsync(Guid id, UpdateGameRequest req, string userName)
    {
        var game = await _db.QuizGames
            .Include(g => g.GameQuestions)
            .Include(g => g.Sessions)
            .FirstOrDefaultAsync(g => g.Id == id && !g.IsDelete);
        if (game == null) return MethodResult<GameSummaryResponse>.ResultWithError("Không tìm thấy", status: 404);

        if (await _db.QuizGames.AnyAsync(g => g.Title == req.Title && g.Id != id && !g.IsDelete))
            return MethodResult<GameSummaryResponse>.ResultWithError("Tên game đã trùng", status: 409);

        game.Title = req.Title;
        game.Description = req.Description;
        game.ShufQ = req.ShufQ; game.ShufA = req.ShufA;
        game.BonusTime = req.BonusTime; game.StreakBonus = req.StreakBonus;
        game.WrongPenalty = req.WrongPenalty;
        game.UpdatedDate = DateTime.UtcNow;
        game.UpdatedUserName = userName;

        // Replace questions
        foreach (var gq in game.GameQuestions) gq.IsDelete = true;

        int order = 0;
        foreach (var iq in req.InlineQuestions)
        {
            var q = new Question
            {
                Id = Guid.NewGuid(),
                Text = iq.Text, MainImg = iq.MainImg, Audio = iq.Audio,
                AnsL = iq.AnsL, AnsR = iq.AnsR, ImgL = iq.ImgL, ImgR = iq.ImgR,
                CorrectSide = iq.CorrectSide, CategoryId = iq.CategoryId,
                Difficulty = iq.Difficulty, Points = iq.Points, Explanation = iq.Explanation,
                CreatedDate = DateTime.UtcNow, CreatedUserName = userName
            };
            _db.Questions.Add(q);
            _db.GameQuestions.Add(new GameQuestion { Id = Guid.NewGuid(), GameId = id, QuestionId = q.Id, Order = order++, CreatedDate = DateTime.UtcNow });
        }
        foreach (var item in req.Questions)
        {
            _db.GameQuestions.Add(new GameQuestion { Id = Guid.NewGuid(), GameId = id, QuestionId = item.QuestionId, Order = item.Order, CreatedDate = DateTime.UtcNow });
        }

        await _db.SaveChangesAsync();

        var updated = await _db.QuizGames
            .Include(g => g.GameQuestions).ThenInclude(gq => gq.Question)
            .Include(g => g.Sessions)
            .FirstAsync(g => g.Id == id);
        return MethodResult<GameSummaryResponse>.ResultWithData(ToGameSummary(updated));
    }

    public async Task<IMethodResult<bool>> DeleteGameAsync(Guid id)
    {
        var entity = await _db.QuizGames.FindAsync(id);
        if (entity == null) return MethodResult<bool>.ResultWithError("Không tìm thấy", status: 404);
        entity.IsDelete = true;
        await _db.SaveChangesAsync();
        return MethodResult<bool>.ResultWithData(true);
    }

    // ── SESSION ───────────────────────────────────────────────────────────────
    public async Task<IMethodResult<LeaderboardEntryResponse>> SaveSessionAsync(SaveSessionRequest req)
    {
        var session = new GameSession
        {
            Id = Guid.NewGuid(),
            GameId = req.GameId,
            PlayerName = req.PlayerName,
            Score = req.Score,
            MaxScore = req.MaxScore,
            CorrectCount = req.CorrectCount,
            WrongCount = req.WrongCount,
            StreakMax = req.StreakMax,
            TotalTimeSeconds = req.TotalTimeSeconds,
            CreatedDate = DateTime.UtcNow
        };
        _db.GameSessions.Add(session);

        // Update question stats
        foreach (var d in req.Details)
        {
            _db.SessionDetails.Add(new SessionDetail
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                QuestionId = d.QuestionId,
                IsCorrect = d.IsCorrect,
                TimeTakenMs = d.TimeTakenMs,
                EarnedPoints = d.EarnedPoints,
                ChosenSide = d.ChosenSide,
                CreatedDate = DateTime.UtcNow
            });

            var q = await _db.Questions.FindAsync(d.QuestionId);
            if (q != null)
            {
                q.TimesShown++;
                if (d.IsCorrect) q.TimesCorrect++;
                q.TotalTimeTakenMs += d.TimeTakenMs;
            }
        }

        await _db.SaveChangesAsync();

        // Compute rank
        var rank = await _db.GameSessions.CountAsync(s => s.GameId == req.GameId && s.Score > req.Score && !s.IsDelete) + 1;
        return MethodResult<LeaderboardEntryResponse>.ResultWithData(new LeaderboardEntryResponse
        {
            Rank = rank, PlayerName = req.PlayerName, Score = req.Score,
            MaxScore = req.MaxScore, CorrectCount = req.CorrectCount,
            WrongCount = req.WrongCount, StreakMax = req.StreakMax,
            TotalTimeSeconds = req.TotalTimeSeconds, PlayedAt = session.CreatedDate
        });
    }

    public async Task<IMethodResult<List<LeaderboardEntryResponse>>> GetLeaderboardAsync(Guid gameId, int top = 10)
    {
        var sessions = await _db.GameSessions
            .Where(s => s.GameId == gameId && !s.IsDelete)
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.TotalTimeSeconds)
            .Take(top)
            .ToListAsync();

        var result = sessions.Select((s, i) => new LeaderboardEntryResponse
        {
            Rank = i + 1, PlayerName = s.PlayerName, Score = s.Score,
            MaxScore = s.MaxScore, CorrectCount = s.CorrectCount,
            WrongCount = s.WrongCount, StreakMax = s.StreakMax,
            TotalTimeSeconds = s.TotalTimeSeconds, PlayedAt = s.CreatedDate
        }).ToList();

        return MethodResult<List<LeaderboardEntryResponse>>.ResultWithData(result, totalRecord: result.Count);
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    public async Task<IMethodResult<QuizStatsOverview>> GetStatsOverviewAsync()
    {
        var total_q = await _db.Questions.CountAsync(q => !q.IsDelete);
        var total_g = await _db.QuizGames.CountAsync(g => !g.IsDelete);
        var total_s = await _db.GameSessions.CountAsync(s => !s.IsDelete);
        var total_ans = await _db.Questions.Where(q => !q.IsDelete).SumAsync(q => (long)q.TimesShown);
        var total_cor = await _db.Questions.Where(q => !q.IsDelete).SumAsync(q => (long)q.TimesCorrect);
        var acc = total_ans > 0 ? Math.Round((double)total_cor / total_ans * 100, 1) : 0;

        return MethodResult<QuizStatsOverview>.ResultWithData(new QuizStatsOverview
        {
            TotalGames = total_g, TotalQuestions = total_q,
            TotalSessions = total_s, TotalAnswered = (int)total_ans, OverallAccuracy = acc
        });
    }

    public async Task<IMethodResult<List<QuestionResponse>>> GetQuestionsWithStatsAsync()
    {
        var qs = await _db.Questions
            .Include(q => q.Category)
            .Where(q => !q.IsDelete && q.TimesShown > 0)
            .OrderBy(q => q.TimesShown > 0 ? (double)q.TimesCorrect / q.TimesShown : 1)
            .ToListAsync();
        return MethodResult<List<QuestionResponse>>.ResultWithData(qs.Select(MapQuestion).ToList(), totalRecord: qs.Count);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────
    private static QuestionResponse MapQuestion(Question q) => new()
    {
        Id = q.Id, Text = q.Text, MainImg = q.MainImg, Audio = q.Audio,
        AnsL = q.AnsL, AnsR = q.AnsR, ImgL = q.ImgL, ImgR = q.ImgR,
        CorrectSide = q.CorrectSide, CategoryId = q.CategoryId,
        CategoryName = q.Category?.Name, Difficulty = q.Difficulty,
        Points = q.Points, Explanation = q.Explanation,
        TimesShown = q.TimesShown, TimesCorrect = q.TimesCorrect,
        AccuracyPct = q.TimesShown > 0 ? Math.Round((double)q.TimesCorrect / q.TimesShown * 100, 1) : null,
        CreatedDate = q.CreatedDate
    };

    private static GameSummaryResponse ToGameSummary(QuizGame g)
    {
        var activeQs = g.GameQuestions.Where(gq => !gq.IsDelete && !gq.Question.IsDelete).ToList();
        var topSession = g.Sessions.Where(s => !s.IsDelete).OrderByDescending(s => s.Score).FirstOrDefault();
        return new GameSummaryResponse
        {
            Id = g.Id, Title = g.Title, Description = g.Description,
            ShufQ = g.ShufQ, ShufA = g.ShufA, BonusTime = g.BonusTime,
            StreakBonus = g.StreakBonus, WrongPenalty = g.WrongPenalty,
            QuestionCount = activeQs.Count,
            MaxScore = activeQs.Sum(gq => gq.Question.Points),
            PlayCount = g.Sessions.Count(s => !s.IsDelete),
            TopRecord = topSession == null ? null : new LeaderboardEntryResponse
            {
                Rank = 1, PlayerName = topSession.PlayerName, Score = topSession.Score,
                TotalTimeSeconds = topSession.TotalTimeSeconds, PlayedAt = topSession.CreatedDate
            },
            UpdatedDate = g.UpdatedDate ?? g.CreatedDate
        };
    }
}
