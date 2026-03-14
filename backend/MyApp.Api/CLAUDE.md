# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
dotnet build
dotnet run --project MyApp.Api.csproj
dotnet run --environment Development
dotnet watch run
```

Swagger UI: `http://localhost:{port}/swagger`

## Architecture

**.NET 9 Web API** — Clean Architecture với 4 layer:

```
API/                   → Controllers, Middleware, Program.cs
Application/           → Services (business logic), DTOs, interfaces
Domain/                → Entities, BaseEntity
Infrastructure/        → EF Core, Repositories, Identity, DI config
```

## Request Flow

```
HTTP Request
  → Controller (BaseController.ResponseResult<T>)
  → IService (Application/Services/)
  → IRepository<T> (EfRepository<T>)
  → AppDbContext (SQL Server)
```

Controllers **không được** chứa EF/LINQ logic. Tất cả logic nằm trong Service.

## BaseController

Tất cả controllers kế thừa `BaseController` (namespace `MyApp.API.Controllers`):
- `CurrentLogin` — lấy `UserLogin` từ `HttpContext.Items["Accounts"]` (set bởi `CustomDataLoginMiddleware` sau khi JWT xác thực)
- `ResponseResult<T>(IMethodResult<T>)` — chuẩn hóa response: `200 OK` khi thành công, `404/403/409` theo `result.Status`

Constructor controller **không** nhận `AppDbContext` hay `IConfiguration` — chỉ nhận service interface.

## Service Pattern

Mỗi service trả về `IMethodResult<T>`:
- `MethodResult<T>.ResultWithData(data)` — thành công
- `MethodResult<T>.ResultWithError("message", status: 404)` — lỗi

## Repository Pattern

`IRepository<T>` với `T : BaseEntity`:
- `TableWithNoLock()` — IQueryable, AsNoTracking, dùng cho queries
- `InsertAsync` / `UpdateAsync` / `DeleteAsync` — mutations
- `UpdateAsync` chỉ lưu các field được gọi `entity.MarkDirty(nameof(prop))`
- Soft delete mặc định (`IsDelete = true`). Hard delete: `DeleteAsync(entity, removeInDatabase: true)`

Global query filter tự động lọc `IsDelete == false` trên mọi entity.

## Authentication Flow

1. JWT Bearer được cấu hình trong `ServicesExtention.ServerConfig` (dùng `Jwt:Key`)
2. `CustomDataLoginMiddleware` chạy sau authentication → đọc claims → ghi `UserLogin` vào `HttpContext.Items["Accounts"]`
3. Controllers dùng `CurrentLogin` để lấy thông tin user đang đăng nhập
4. Refresh token rotation: mỗi lần refresh, token cũ bị revoke (`IsDelete = true`), token mới được tạo
5. `ListRole` lưu roles cách nhau bằng `";"` (vd: `"Admin;User"`)

## Entities vs Database

Entities trong `Domain/Entities/` phải khớp schema DB (`HUNGSILVER.MyAppDb`):
- `User` — khớp bảng `Users` (22 cột). `Gender` là `int?`. Không có `FullName`, `Role`, `IsActive`
- `Product` — bảng chưa tồn tại trong DB, EF sẽ tạo khi `EnsureCreated()`
- `Role`, `RefreshToken` — khớp DB

## DI Registration

- `DIContext` (`DIExtension.cs`) — DbContext, `IRepository<>`, AutoMapper
- `DIServices` (`DIServiceExtention.cs`) — `IAuthService`, `IProductService`, `IUserService`, `IJwtTokenService`
- Khi thêm service mới: implement interface → đăng ký trong `DIServiceExtention.DIServices`

## Configuration (appsettings.json)

- `Jwt:Key` — dùng cho cả generate và validate token
- `Jwt:AccessTokenExpirationMinutes` — mặc định 60
- `Jwt:RefreshTokenExpirationDays` — mặc định 7
- `Google:ClientId` — cần thiết cho Google login
- `AllowedOrigins` — CORS origins array
