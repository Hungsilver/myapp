using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.DTOs;
using MyApp.Api.Models;

namespace MyApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null)
    {
        var query = db.Products.Where(p => p.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(new ApiResponse<PagedResult<ProductDto>>(true, "OK",
            new PagedResult<ProductDto>(items, total, page, pageSize)));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null || !product.IsActive)
            return NotFound(new ApiResponse<ProductDto>(false, "Không tìm thấy sản phẩm", null));

        return Ok(new ApiResponse<ProductDto>(true, "OK", ToDto(product)));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetCategories()
    {
        var categories = await db.Products
            .Where(p => p.IsActive)
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync();
        return Ok(new ApiResponse<List<string>>(true, "OK", categories));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<ProductDto>(true, "Tạo sản phẩm thành công", ToDto(product)));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(int id, UpdateProductDto dto)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new ApiResponse<ProductDto>(false, "Không tìm thấy sản phẩm", null));

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.Category = dto.Category;
        product.ImageUrl = dto.ImageUrl;

        await db.SaveChangesAsync();
        return Ok(new ApiResponse<ProductDto>(true, "Cập nhật thành công", ToDto(product)));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new ApiResponse<object>(false, "Không tìm thấy sản phẩm", null));

        product.IsActive = false;
        await db.SaveChangesAsync();
        return Ok(new ApiResponse<object>(true, "Xóa thành công", null));
    }

    private static ProductDto ToDto(Product p) =>
        new(p.Id, p.Name, p.Description, p.Price, p.Stock, p.Category, p.ImageUrl, p.CreatedAt);
}
