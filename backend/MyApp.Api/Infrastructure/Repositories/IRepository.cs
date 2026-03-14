using MyApp.Api.Domain;

namespace MyApp.Infrastructure.Repositories
{
    public partial interface IRepository<T> where T : BaseEntity
    {
        Task<T> GetByIdAsync(object id);
        Task InsertAsync(T entity);
        Task InsertAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        Task DeleteAsync(T entity, bool removeInDatabase = false);
        Task DeleteAsync(IEnumerable<T> entities, bool removeInDatabase = false);
        IQueryable<T> TableWithNoLock();
    }
}
