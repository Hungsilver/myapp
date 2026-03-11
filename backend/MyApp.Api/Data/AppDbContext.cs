using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models;

namespace MyApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e => {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Product>(e => {
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
        });

        // Seed data
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop Dell XPS 15", Description = "Laptop cao cấp cho developer", Price = 35000000, Stock = 10, Category = "Electronics", ImageUrl = "https://placehold.co/300x200?text=Laptop", CreatedAt = DateTime.UtcNow },
            new Product { Id = 2, Name = "iPhone 15 Pro", Description = "Điện thoại cao cấp Apple", Price = 28000000, Stock = 15, Category = "Electronics", ImageUrl = "https://placehold.co/300x200?text=iPhone", CreatedAt = DateTime.UtcNow },
            new Product { Id = 3, Name = "Bàn phím cơ Keychron", Description = "Bàn phím cơ cho lập trình viên", Price = 3500000, Stock = 30, Category = "Accessories", ImageUrl = "https://placehold.co/300x200?text=Keyboard", CreatedAt = DateTime.UtcNow },
            new Product { Id = 4, Name = "Màn hình LG 27 inch", Description = "Màn hình 4K chuyên đồ họa", Price = 12000000, Stock = 8, Category = "Electronics", ImageUrl = "https://placehold.co/300x200?text=Monitor", CreatedAt = DateTime.UtcNow },
            new Product { Id = 5, Name = "Chuột Logitech MX Master", Description = "Chuột không dây cao cấp", Price = 2800000, Stock = 25, Category = "Accessories", ImageUrl = "https://placehold.co/300x200?text=Mouse", CreatedAt = DateTime.UtcNow }
        );
    }
}
