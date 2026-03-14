using MyApp.Application.Common;
using MyApp.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Domain;

namespace MyApp.Application.Services
{
    public interface IBaseService<T>
    {
        Task<IMethodResult<IEnumerable<T>>> GetAsync();
        Task<IMethodResult<T>> GetByIdAsync(Guid id);
        Task<IMethodResult<Guid>> CreateAsync(T entity);
        Task<IMethodResult<T>> UpdateAsync(T entity);
        Task<IMethodResult<bool>> DeleteAsync(Guid id);
    }

    public class BaseService<T> : IBaseService<T> where T : BaseEntity
    {
        private readonly IRepository<T> _repository;

        public BaseService(IRepository<T> repository)
        {
            _repository = repository;
        }

        public async Task<IMethodResult<Guid>> CreateAsync(T entity)
        {
            try
            {
                await _repository.InsertAsync(entity);
                return MethodResult<Guid>.ResultWithData(entity.Id);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<IMethodResult<bool>> DeleteAsync(Guid id)
        {
            var itemExist = await _repository.GetByIdAsync(id);
            if (itemExist == null) {
                return MethodResult<bool>.ResultWithError(Contants.MESS_Delete_Faild);
            }
            await _repository.DeleteAsync(itemExist);
            return MethodResult<bool>.ResultWithData(true);
        }

        public async Task<IMethodResult<IEnumerable<T>>> GetAsync()
        {
            var data = await _repository.TableWithNoLock().ToListAsync();
            return MethodResult<IEnumerable<T>>.ResultWithData(data);
        }

        public async Task<IMethodResult<T>> GetByIdAsync(Guid id)
        {
            var item = await _repository.GetByIdAsync(id);
            return MethodResult<T>.ResultWithData(item);
        }

        public async Task<IMethodResult<T>> UpdateAsync(T entity)
        {
            await _repository.UpdateAsync(entity);
            return MethodResult<T>.ResultWithData(entity);
        }
    }
}
