# MyApp - Angular 18 + .NET Core 9 + SQL Server

Full-stack web app với CI/CD deploy lên VPS.

## Stack
- **Frontend**: Angular 18 (Standalone Components, Signals)
- **Backend**: .NET Core 9 Web API + Entity Framework Core
- **Database**: SQL Server 2022
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions → Docker Hub → VPS

## Chạy local (Development)

### Yêu cầu
- Docker Desktop
- Node.js 20+
- .NET SDK 9

### Khởi động backend + SQL Server bằng Docker
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Chạy Angular
```bash
cd frontend
npm install
npm start
# Mở http://localhost:4200
```

### Swagger API docs
Mở http://localhost:8080/swagger

## Deploy Production

### GitHub Secrets cần thiết
| Secret | Giá trị |
|--------|---------|
| DOCKER_HUB_USERNAME | Username Docker Hub |
| DOCKER_HUB_TOKEN | Access Token Docker Hub |
| VPS_HOST | IP của VPS |
| VPS_USER | User SSH (thường là root) |
| VPS_SSH_KEY | Private key SSH |
| VPS_PORT | Port SSH (22) |
| DB_PASSWORD | Mật khẩu SQL Server |
| JWT_KEY | Secret key JWT (>= 32 ký tự) |
| DOMAIN | yourdomain.com |

### Deploy lần đầu trên VPS
```bash
mkdir -p /opt/myapp
cd /opt/myapp
# Upload docker-compose.yml lên VPS
docker compose pull
docker compose up -d
```

### Cấu hình Nginx + SSL
```bash
# Copy file nginx/nginx.conf -> /etc/nginx/sites-available/myapp
# Sửa yourdomain.com thành domain thật
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Tính năng
- ✅ Đăng ký / Đăng nhập với JWT
- ✅ Danh sách sản phẩm với tìm kiếm & filter
- ✅ Phân trang
- ✅ CRUD sản phẩm (cần đăng nhập)
- ✅ Auto migrate database khi khởi động
- ✅ Swagger UI

- Hungsilver
