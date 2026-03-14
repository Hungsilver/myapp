using System.Data;

namespace MyApp.Infrastructure.Configs
{
    public interface IDapperContext : IDisposable
    {
        IDbConnection Connection { get; }
    }

    public class DapperContext : IDapperContext
    {
        public IDbConnection Connection => throw new NotImplementedException();

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}
