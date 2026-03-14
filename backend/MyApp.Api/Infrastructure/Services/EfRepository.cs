using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using MyApp.Api.Domain;
using MyApp.Api.Infrastructure.Data;
using MyApp.Infrastructure.Identity;
using MyApp.Infrastructure.Repositories;

namespace MyApp.Infrastructure.Services
{
    public partial class EfRepository<T> : IRepository<T> where T : BaseEntity
    {
        private readonly IUserPrincipalService _userPrincipalService;
        private readonly AppDbContext _context;
        private DbSet<T> _entities;

        private const string NoLockTag = "NOLOCK";
        protected virtual DbSet<T> Entities
        {
            get 
            { 
                if(_entities == null)
                    _entities = _context.Set<T>();
                return _entities; 
            }
        }

        public EfRepository(IUserPrincipalService userPrincipalService, AppDbContext context)
        {
            this._userPrincipalService = userPrincipalService;
            this._context = context;
        }

        public async Task DeleteAsync(T entity, bool removeInDatabase = false)
        {
            if(entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }
            try
            {
                if(removeInDatabase == true)
                {
                    var local = _context.Set<T>().Local.FirstOrDefault(x => x.Id == entity.Id);
                    if (local != null)
                    {
                        _context.Entry(local).State = EntityState.Detached;
                    }
                    _context.Entry(entity).State = EntityState.Deleted;
                    await _context.SaveChangesAsync();
                    return;
                }

                entity.IsDelete = true;
                _context.Update<T>(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex) 
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public Task DeleteAsync(IEnumerable<T> entities, bool removeInDatabase = false)
        {
            throw new NotImplementedException();
        }

        public async Task<T> GetByIdAsync(object id)
        {
            return await this.Entities.AsNoTracking().TagWith(NoLockTag).FirstOrDefaultAsync(x => x.Id == (Guid)id);
        }

        public async Task InsertAsync(T entity)
        {
            try
            {
                if(entity == null) throw new ArgumentNullException(nameof(entity));
                if(entity.Id == Guid.Empty) entity.Id = Guid.NewGuid();
                if (entity.CreatedDate == null || entity.CreatedDate == DateTime.MinValue)
                {
                    entity.CreatedDate = DateTime.Now;
                }
                entity.UpdatedDate = DateTime.Now;
                var user = _userPrincipalService.GetUserLogin();
                if (user != null)
                {
                    entity.CreatedUserName = user.UserName;
                    entity.UpdatedUserName = user.UserName;
                }

                await this.Entities.AddAsync(entity);
                await this._context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task InsertAsync(IEnumerable<T> entities)
        {
            if(!entities.Any()) throw new ArgumentNullException();
            foreach(var item in entities)
            {
                await this.InsertAsync(item);
            }
        }

        public IQueryable<T> TableWithNoLock()
        {
            return this.Entities.AsNoTracking().TagWith(NoLockTag);
        }

        public async Task UpdateAsync(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            try
            {
                entity.UpdatedDate = DateTime.Now;
                var user = _userPrincipalService.GetUserLogin();
                if (user != null)
                {
                    entity.UpdatedUserName = user.UserName;
                }
                var local = _context.Set<T>().Local.FirstOrDefault(entry => entry.Id == entity.Id);

                // check if local is not null 
                if (local != null)
                {
                    // detach
                    _context.Entry(local).State = EntityState.Detached;
                }
                EntityEntry entry = _context.Entry<T>(entity);
                if (entry.State == EntityState.Detached)  
                {
                    _context.Set<T>().Attach(entity);
                    // TODO other properties
                    foreach (var propperty in entity.GetDirtyProperties())
                    {
                        entry.Property(propperty).IsModified = true;
                    }

                    //thêm thời gian cập nhật
                    entry.Property("UpdatedDate").IsModified = true;
                    entry.Property("UpdatedUserName").IsModified = true;
                }

                await this._context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public Task UpdateAsync(IEnumerable<T> entities)
        {
            throw new NotImplementedException();
        }
    }
}
