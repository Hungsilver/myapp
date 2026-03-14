using MyApp.Api.Domain.Entities;
using MyApp.Application.Common;
using MyApp.Application.DTOs.Authen;
using MyApp.Application.Services;
using MyApp.Infrastructure.Repositories;

namespace MyApp.Api.Application.Services
{
    public interface IUserService
    {
        Task<IMethodResult<List<User>>> GetFilterAsync(User req, UserLogin userLogin);
        Task<IMethodResult<List<User>>> GetAllAsync(UserLogin userLogin);
    }
    public class UserService : IUserService
    {
        private readonly IRepository<User> _repo;

        public UserService(IRepository<User> repo)
        {
            _repo = repo;
        }

        public Task<IMethodResult<List<User>>> GetAllAsync(UserLogin userLogin)
        {
            throw new NotImplementedException();
        }

        public Task<IMethodResult<List<User>>> GetFilterAsync(User req, UserLogin userLogin)
        {
            throw new NotImplementedException();
        }
    }
}
