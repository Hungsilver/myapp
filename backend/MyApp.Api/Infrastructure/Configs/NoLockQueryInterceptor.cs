using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;
using System.Text.RegularExpressions;

namespace MyApp.Infrastructure.Configs
{
    /// <summary>
    /// Interceptor để tự động thêm WITH (NOLOCK) vào các query có tag "NOLOCK"
    /// </summary>
    public class NoLockQueryInterceptor : DbCommandInterceptor
    {
        private static readonly Regex TableAliasRegex = new Regex(
            @"FROM\s+(\[?[\w]+\]?\.\[?[\w]+\]?|\[?[\w]+\]?)(\s+AS\s+\[?[\w]+\]?)?",
            RegexOptions.IgnoreCase | RegexOptions.Multiline
        );

        private static readonly Regex JoinTableRegex = new Regex(
            @"(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)\s+(\[?[\w]+\]?\.\[?[\w]+\]?|\[?[\w]+\]?)(\s+AS\s+\[?[\w]+\]?)?",
            RegexOptions.IgnoreCase | RegexOptions.Multiline
        );

        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            AddNoLockHint(command);
            return result;
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            AddNoLockHint(command);
            return new ValueTask<InterceptionResult<DbDataReader>>(result);
        }

        private static void AddNoLockHint(DbCommand command)
        {
            // Chỉ thêm NOLOCK nếu query có tag "NOLOCK"
            if (!command.CommandText.Contains("-- NOLOCK", StringComparison.OrdinalIgnoreCase))
                return;

            // Tránh thêm NOLOCK nhiều lần
            if (command.CommandText.Contains("WITH (NOLOCK)", StringComparison.OrdinalIgnoreCase))
                return;

            var sql = command.CommandText;

            // Thêm NOLOCK vào FROM clause
            sql = TableAliasRegex.Replace(sql, match =>
            {
                var tableName = match.Groups[1].Value;
                var alias = match.Groups[2].Value;
                return $"FROM {tableName} WITH (NOLOCK){alias}";
            });

            // Thêm NOLOCK vào JOIN clause
            sql = JoinTableRegex.Replace(sql, match =>
            {
                var joinType = match.Groups[1].Value;
                var tableName = match.Groups[2].Value;
                var alias = match.Groups[3].Value;
                return $"{joinType} {tableName} WITH (NOLOCK){alias}";
            });

            command.CommandText = sql;
        }
    }
}
