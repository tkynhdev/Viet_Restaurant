# Viet Restaurant - Hệ Thống Quản Lý Nhà Hàng Thông Minh

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## Giới Thiệu

Viet Restaurant là hệ thống quản lý nhà hàng toàn diện, phát triển bằng React.js và Node.js. Hệ thống cung cấp các tính năng quản lý nhà hàng hiện đại bao gồm: quản lý món ăn, đặt bàn, thanh toán online, chatbot AI, và nhiều tính năng thông minh khác.

### Tính Năng Nổi Bật

- **Quản lý Menu**: Thêm, sửa, xóa món ăn với hình ảnh (Cloudinary)
- **Đặt bàn Online**: Hệ thống đặt bàn và quản lý thông tin khách hàng
- **Thanh toán Online**: Tích hợp VNPAY cho thanh toán an toàn
- **Chatbot AI**: Trợ lý ảo AI giúp khách hàng chọn món và đặt bàn
- **Quản lý Đơn hàng**: Theo dõi đơn hàng và trạng thái thanh toán
- **Quản lý Bàn**: Phân công bàn và theo dõi trạng thái
- **Báo cáo Doanh thu**: Phân tích và báo cáo doanh thu bằng AI
- **Chấm công Nhân viên**: Hệ thống chấm công và quản lý nhân viên
- **Real-time Updates**: Sử dụng Socket.IO cho cập nhật thời gian thực

## Tech Stack

### Frontend
- **React 18** - UI Framework
- **React Bootstrap** - UI Components
- **React Router** - Routing
- **Axios** - HTTP Client
- **Socket.io-client** - Real-time Communication
- **Toastify** - Notifications

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Socket.io** - Real-time Communication
- **Prisma** - ORM & Database Management
- **MySQL** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password Hashing
- **Multer + Cloudinary** - Image Upload
- **Google Generative AI** - AI Chatbot

### Other Technologies
- **Docker & Docker Compose** - Containerization
- **Vite** - Build Tool
- **VNPAY** - Payment Gateway
- **Render** - Cloud Deployment

## Cài Đặt và Chạy

### Yêu Cầu

- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (tùy chọn)

### 1. Chạy Local Development

#### Backend Setup

```bash
# Clone repository
git clone https://github.com/tkynhdev/Viet_Restaurant.git
cd Viet_Restaurant/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# DATABASE_URL="mysql://root:@127.0.0.1:3306/restaurant_db"
# JWT_SECRET="your_secret_here"
# GEMINI_API_KEY="your_gemini_api_key"
# CLOUDINARY_CLOUD_NAME="your_cloud_name"
# CLOUDINARY_API_KEY="your_api_key"
# CLOUDINARY_API_SECRET="your_api_secret"

# Run database migration
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend server
npm run dev
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# VITE_API_URL="http://localhost:5000"

# Start frontend server
npm run dev
```

### 2. Chạy với Docker

```bash
# Clone repository
git clone https://github.com/tkynhdev/Viet_Restaurant.git
cd Viet_Restaurant

# Copy Docker environment file
cp .env.docker.example .env.docker

# Configure environment variables in .env.docker
# Fill in your actual values for production

# Build and run containers
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Truy Cập Demo

- **Frontend**: [https://dthynh.shop](https://dthynh.shop)
- **API Documentation**: [https://dthynh.shop/api](https://dthynh.shop/api)

### Tài Khoản Demo

- **Admin**: `admin@gmail.com` / `123456`
- **Staff**: `staff@gmail.com` / `123456`
- **Chef**: `bep@gmail.com` / `123456`
- **Cashier**: `thungan@gmail.com` / `123456`

## Cấu Trúc Thư Mục

```
Viet_Restaurant/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   └── app.js            # Main app file
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Database seed
│   ├── config/
│   │   └── cloudinary.js    # Cloudinary config
│   ├── uploads/             # Local uploads (deprecated)
│   └── package.json
│   └── .env.example
│
├── frontend/                  # Frontend React App
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/
│   └── package.json
│   └── .env.example
│
├── docker-compose.yml         # Docker configuration
├── .env.docker.example        # Docker environment template
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add new menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation status

### AI Chatbot
- `POST /api/ai/chat` - Chat with AI assistant

### Payment
- `POST /api/payment/create_payment_url` - Create VNPAY payment
- `GET /api/payment/vnpay_return` - VNPAY return callback

## Cấu Hình Môi Trường

### Backend Environment Variables

```bash
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# JWT
JWT_SECRET="your_strong_secret"

# AI
GEMINI_API_KEY="your_gemini_api_key"

# Cloud Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Payment
VNP_TMN_CODE="your_tmn_code"
VNP_HASH_SECRET="your_hash_secret"

# CORS
FRONTEND_URL="https://dthynh.shop"
```

### Frontend Environment Variables

```bash
VITE_API_URL="https://your-backend-url.onrender.com"
```

## Deployment

### Render Deployment

1. **Backend Service**
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Configure environment variables
   - Add PostgreSQL database (or use external MySQL)

2. **Frontend Service**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set start command: `npm run preview` or serve static files
   - Configure environment variables

### Docker Deployment

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Dự án này được giấy phép theo [MIT License](LICENSE).

## Liên Hệ

**Nguyễn Đức Thịnh**
- Email: thinhdev6604@gmail.com
- Phone: 0967877911
- GitHub: [tkynhdev](https://github.com/tkynhdev)

## Lịch Sử Phiên Bản

- **v1.0.0** - Bản đầu tiên với các tính năng cơ bản
- **v1.1.0** - Thêm chatbot AI và Cloudinary
- **v1.2.0** - Tinh chỉnh và vá lỗi
- **v2.0.0** - Cài đặt Docker và production ready

## Hỗ Trợ

Nếu có bất kỳ câu hỏi hay yêu cầu hỗ trợ, vui lòng liên hệ qua:

- Email: thinhdev6604@gmail.com
- Phone: 0967877911
- GitHub Issues: [Viet Restaurant Issues](https://github.com/tkynhdev/Viet_Restaurant/issues)

---

**Cảm ơn bạn đã sử dụng hệ thống Viet Restaurant!** 🍽️
