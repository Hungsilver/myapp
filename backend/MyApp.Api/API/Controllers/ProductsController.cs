using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Application.Services;
using MyApp.Application.DTOs.Product;
using MyApp.API.Controllers;

namespace MyApp.Api.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterRequest filter)
    {
        var result = await _productService.GetFilterAsync(filter, CurrentLogin);
        return ResponseResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _productService.GetByIdAsync(id);
        return ResponseResult(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _productService.GetCategoriesAsync();
        return ResponseResult(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var result = await _productService.CreateAsync(request, CurrentLogin);
        return ResponseResult(result);
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var result = await _productService.UpdateAsync(id, request, CurrentLogin);
        return ResponseResult(result);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _productService.DeleteAsync(id, CurrentLogin);
        return ResponseResult(result);
    }
}
