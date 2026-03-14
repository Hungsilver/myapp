using Microsoft.EntityFrameworkCore;
using MyApp.Api.Domain;
using MyApp.Api.Domain.Entities;
using MyApp.Api.Domain.Entities.Quiz;
using System.Linq.Expressions;

namespace MyApp.Api.Infrastructure.Data;

public class AppDbContext: DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Quiz Hub
    public DbSet<QuestionCategory> QuestionCategories => Set<QuestionCategory>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizGame> QuizGames => Set<QuizGame>();
    public DbSet<GameQuestion> GameQuestions => Set<GameQuestion>();
    public DbSet<GameSession> GameSessions => Set<GameSession>();
    public DbSet<SessionDetail> SessionDetails => Set<SessionDetail>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public AppDbContext() : base()
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var prop = Expression.Property(parameter, nameof(BaseEntity.IsDelete));
                var compare = Expression.Equal(prop, Expression.Constant(false));
                var lambda = Expression.Lambda(compare, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}
