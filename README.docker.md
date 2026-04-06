# 🐳 Docker Setup Guide - Restaurant Management System

## Yêu Cầu Hệ Thống

- **Docker**: v20.10+
- **Docker Compose**: v1.29+
- Cổng trống: `3307` (MySQL), `5000` (Backend), `5173` (Frontend)

### Cài Đặt Docker

**Windows / macOS**: 
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 🚀 Quick Start

### 1. Clone & Chuẩn Bị

```bash
# Vào thư mục gốc
cd do_an_chuyen_nganh

# Copy file .env
cp .env.docker .env

# (Tùy chọn) Sửa GEMINI_API_KEY trong .env nếu muốn test AI
```

### 2. Khởi Động All Services

```bash
# Chạy tất cả (Frontend + Backend + Database)
docker-compose up -d

# Hoặc xem logs real-time
docker-compose up
```

### 3. Kiểm Tra Status

```bash
# Xem danh sách container
docker-compose ps

# Output:
# NAME                    STATUS            PORTS
# restaurant_frontend_dev   Up 2 minutes    0.0.0.0:5173->5173/tcp
# restaurant_backend_dev    Up 2 minutes    0.0.0.0:5000->5000/tcp
# restaurant_db_dev         Up 2 minutes    0.0.0.0:3307->3306/tcp
```

### 4. Truy Cập Ứng Dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/menu
- **Database**: `localhost:3307` (MySQL Client hoặc DBeaver)

---

## 📋 Common Commands

### Start/Stop

```bash
# Start tất cả
docker-compose up -d

# Stop tất cả
docker-compose down

# Stop + Xóa volumes (⚠️ Xóa DB data)
docker-compose down -v

# Restart một service
docker-compose restart backend
```

### Logs

```bash
# Xem logs tất cả
docker-compose logs -f

# Logs riêng backend
docker-compose logs -f backend

# Logs riêng frontend (50 dòng cuối)
docker-compose logs --tail 50 frontend
```

### Exec Commands

```bash
# Chạy command trong backend
docker-compose exec backend npx prisma studio

# Chạy bash trong backend
docker-compose exec backend sh

# Chạy npm trong frontend
docker-compose exec frontend npm list
```

---

## 🛠️ Development Workflow

### Hot Reload

**Frontend & Backend đều hỗ trợ hot reload**:
- Sửa file trong `src/` → Lưu → Browser tự refresh

```bash
# Sửa backend/src/controllers/menuController.js
# → Vite sẽ reload tự động

# Sửa frontend/src/pages/HomePage.jsx
# → Vite sẽ reload tự động
```

### Database Migrations

```bash
# Vào backend container
docker-compose exec backend sh

# Chạy migration
npx prisma migrate dev --name add_new_field

# Studio (UI để xem/sửa DB)
npx prisma studio
```

### Seed Database

```bash
# Chạy seed.js để thêm dữ liệu mẫu
docker-compose exec backend npx prisma db seed
```

---

## 🔧 Troubleshooting

### 1. Backend không kết nối DB

**Lỗi**: `connect ECONNREFUSED 127.0.0.1:3306`

**Giải pháp**:
```bash
# Kiểm tra health DB
docker-compose exec db mysqladmin ping -h localhost

# Xem logs DB
docker-compose logs db

# Restart DB
docker-compose restart db
```

### 2. Frontend không load

**Lỗi**: `Vite is not defined` hoặc blank page

**Giải pháp**:
```bash
# Xóa node_modules & reinstall
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Hoặc vào container cleanup
docker-compose exec frontend rm -rf node_modules && npm install
```

### 3. Port đã được sử dụng

**Lỗi**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Giải pháp**:
```bash
# Thay đổi port trong .env
echo "BACKEND_PORT=5001" >> .env

# Hoặc kill process trên port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### 4. Database connection error

**Kiểm tra DATABASE_URL**:
```bash
# Nên là:
mysql://restaurant_user:restaurant_pass@db:3306/restaurant_db

# Không phải:
mysql://restaurant_user:restaurant_pass@localhost:3306/restaurant_db
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│          DOCKER NETWORK: restaurant_network         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────┐ │
│  │   Frontend   │   │   Backend    │   │   DB    │ │
│  │   (Vite)     │   │ (Express)    │   │ (MySQL) │ │
│  │              │   │              │   │         │ │
│  │ :5173        │◄─►│ :5000        │◄─►│ :3307   │ │
│  └──────────────┘   └──────────────┘   └─────────┘ │
│       ▲                    ▲                  │      │
│       │                    │                  │      │
│       └────────────────────┴──────────────────┘      │
│         (Host Access: localhost)                    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Workflow cho Trình Diễn

### Scenario: Demo cho Nhà Tuyển Dụng

```bash
# 1. Khởi động hệ thống (lần đầu ~2-3 phút)
docker-compose up -d

# 2. Chờ backend ready
docker-compose logs backend | grep "Server đang chạy"

# 3. Mở browser
# Frontend: http://localhost:5173
# API: http://localhost:5000/api/menu

# 4. Demo features
# - Đăng nhập (Admin/Bếp/Thu ngân/Khách)
# - Xem menu, thêm món
# - Đặt bàn, thanh toán
# - Xem báo cáo (Admin)

# 5. Dừng lại
docker-compose down
```

---

## 📝 Notes

- **Database Data**: Được lưu trong volume `db_data` (giữ sau khi `down`)
- **Hot Reload**: Chỉ áp dụng cho file `src/` (không thay đổi package.json)
- **Env Variables**: Quản lý bằng `.env.docker` (không commit vào git)
- **Production**: Sử dụng Dockerfile khác hoặc CI/CD (GitHub Actions)

---

## 📞 Support

Nếu gặp vấn đề:
1. Xem logs: `docker-compose logs -f`
2. Check Docker Desktop running
3. Verify ports: `netstat -ano` (Windows) / `lsof -i` (Mac/Linux)
