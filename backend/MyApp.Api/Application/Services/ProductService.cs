using Microsoft.EntityFrameworkCore;
using MyApp.Api.Domain.Entities;
using MyApp.Application.Common;
using MyApp.Application.DTOs.Authen;
using MyApp.Application.DTOs.Product;
using MyApp.Infrastructure.Repositories;

namespace MyApp.Api.Application.Services
{
    public interface IProductService
    {
        Task<IMethodResult<PagedProductResponse>> GetFilterAsync(ProductFilterRequest request, UserLogin? userLogin);
        Task<IMethodResult<ProductResponse>> GetByIdAsync(Guid id);
        Task<IMethodResult<List<string>>> GetCategoriesAsync();
        Task<IMethodResult<ProductResponse>> CreateAsync(CreateProductRequest request, UserLogin? userLogin);
        Task<IMethodResult<ProductResponse>> UpdateAsync(Guid id, UpdateProductRequest request, UserLogin? userLogin);
        Task<IMethodResult<bool>> DeleteAsync(Guid id, UserLogin? userLogin);
    }

    public class ProductService : IProductService
    {
        private readonly IRepository<Product> _repo;

        public ProductService(IRepository<Product> repo)
        {
            _repo = repo;
        }

        public async Task<IMethodResult<PagedProductResponse>> GetFilterAsync(ProductFilterRequest request, UserLogin? userLogin)
        {
            var query = _repo.TableWithNoLock();

            if (!string.IsNullOrWhiteSpace(request.Search))
                query = query.Where(p => p.Name.Contains(request.Search) || p.Description.Contains(request.Search));

            if (!string.IsNullOrWhiteSpace(request.Category))
                query = query.Where(p => p.Category == request.Category);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.CreatedDate)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(p => ToResponse(p))
                .ToListAsync();

            return MethodResult<PagedProductResponse>.ResultWithData(new PagedProductResponse
            {
                Items = items,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize
            }, totalRecord: total);
        }

        public async Task<IMethodResult<ProductResponse>> GetByIdAsync(Guid id)
        {
            var product = await _repo.TableWithNoLock().FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return MethodResult<ProductResponse>.ResultWithError("Không tìm thấy sản phẩm", status: 404);

            return MethodResult<ProductResponse>.ResultWithData(ToResponse(product));
        }

        public async Task<IMethodResult<List<string>>> GetCategoriesAsync()
        {
            var categories = await _repo.TableWithNoLock()
                .Select(p => p.Category)
                .Distinct()
                .ToListAsync();

            return MethodResult<List<string>>.ResultWithData(categories);
        }

        public async Task<IMethodResult<ProductResponse>> CreateAsync(CreateProductRequest request, UserLogin? userLogin)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                Category = request.Category,
                ImageUrl = request.ImageUrl ?? string.Empty,
                IsActive = true
            };

            await _repo.InsertAsync(product);
            return MethodResult<ProductResponse>.ResultWithData(ToResponse(product));
        }

        public async Task<IMethodResult<ProductResponse>> UpdateAsync(Guid id, UpdateProductRequest request, UserLogin? userLogin)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null)
                return MethodResult<ProductResponse>.ResultWithError("Không tìm thấy sản phẩm", status: 404);

            if (request.Name != null) { product.Name = request.Name; product.MarkDirty(nameof(product.Name)); }
            if (request.Description != null) { product.Description = request.Description; product.MarkDirty(nameof(product.Description)); }
            if (request.Price != null) { product.Price = request.Price.Value; product.MarkDirty(nameof(product.Price)); }
            if (request.Stock != null) { product.Stock = request.Stock.Value; product.MarkDirty(nameof(product.Stock)); }
            if (request.Category != null) { product.Category = request.Category; product.MarkDirty(nameof(product.Category)); }
            if (request.ImageUrl != null) { product.ImageUrl = request.ImageUrl; product.MarkDirty(nameof(product.ImageUrl)); }

            await _repo.UpdateAsync(product);
            return MethodResult<ProductResponse>.ResultWithData(ToResponse(product));
        }

        public async Task<IMethodResult<bool>> DeleteAsync(Guid id, UserLogin? userLogin)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null)
                return MethodResult<bool>.ResultWithError("Không tìm thấy sản phẩm", status: 404);

            await _repo.DeleteAsync(product);
            return MethodResult<bool>.ResultWithData(true);
        }

        private static ProductResponse ToResponse(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            CreatedDate = p.CreatedDate
        };
    }
}
