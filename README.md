# Viet Restaurant - Hê Thong Quan Ly Nha Hang Thong Minh

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## Gi Thiêu

Viet Restaurant là hê thong quan ly nha hang toàn dien, phát triên v i React.js và Node.js. Hê thong cung câp các tính nang quan ly nhà hàng hiên dai bao gom: quàn lý món an, dat bàn, thanh toán online, chatbot AI, và nhiêu tính nang thông minh khác.

### Tính Nang Nôi Bat

- **Quàn lý Menu**: Thêm, sua, xoa món an v i hình ành (Cloudinary)
- **Dat bàn Online**: Hê thong dat bàn và quàn ly thông tin khách hàng
- **Thanh toán Online**: Tích hop VNPAY cho thanh toán an toàn
- **Chatbot AI**: Trô lý ao AI h trö khách hàng chon món và dat bàn
- **Quàn lý Don hàng**: Theo dõi don hàng và tràng thái thanh toán
- **Quàn lý Bàn**: Phan công bàn và theo dõi tràng thái
- **Báo cáo Doanh thu**: Phân tích và báo cáo doanh thu v i AI
- **Cham công Nhân viên**: Hê thong cham công và quàn lý nhân viên
- **Real-time Updates**: Sû dung Socket.IO cho cap nhât thoi gian thuc

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

## Cai Dat và Chay

### Yêu Cau

- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (tu y chon)

### 1. Chay Local Development

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

### 2. Chay v i Docker

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

### 3. Truy Cap Demo

- **Frontend**: [https://dthynh.shop](https://dthynh.shop)
- **API Documentation**: [https://dthynh.shop/api](https://dthynh.shop/api)

### Tai Khoan Demo

- **Admin**: `admin@gmail.com` / `123456`
- **Staff**: `staff@gmail.com` / `123456`
- **Chef**: `bep@gmail.com` / `123456`
- **Cashier**: `thungan@gmail.com` / `123456`

## Cau Truc Thu Muc

```
Viet_Restaurant/
âââ backend/                    # Backend API
â   âââ src/
â   â   âââ controllers/       # Route controllers
â   â   âââ middleware/        # Custom middleware
â   â   âââ routes/           # API routes
â   â   âââ utils/            # Utility functions
â   â   âââ app.js            # Main app file
â   âââ prisma/
â   â   âââ schema.prisma    # Database schema
â   â   âââ seed.js          # Database seed
â   âââ config/
â   â   âââ cloudinary.js    # Cloudinary config
â   âââ uploads/             # Local uploads (deprecated)
â   âââ package.json
â   âââ .env.example
â
âââ frontend/                  # Frontend React App
â   âââ src/
â   â   âââ components/      # Reusable components
â   â   âââ pages/           # Page components
â   â   âââ context/         # React contexts
â   â   âââ utils/           # Utility functions
â   â   âââ App.jsx          # Main app component
â   â   âââ main.jsx         # Entry point
â   âââ public/
â   âââ package.json
â   âââ .env.example
â
âââ docker-compose.yml         # Docker configuration
âââ .env.docker.example        # Docker environment template
âââ .gitignore
âââ README.md
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

## Cau Hinh Môi Truong

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

Dê án này duyc giói phep theo [MIT License](LICENSE).

## Liên Hê

**Nguyên Duc Thinh**
- Email: thinhdev6604@gmail.com
- Phone: 0967877911
- GitHub: [tkynhdev](https://github.com/tkynhdev)

## Lich Su Phien Ban

- **v1.0.0** - Ban dau tiên v i các tính nang co ban
- **v1.1.0** - Thêm chatbot AI và Cloudinary
- **v1.2.0** - Tinh chinh và vá lo i
- **v2.0.0** - Cai dat Docker và production ready

## Hô Trô

Nêú có bât ky câu hôi hay yêu câu h trô, vui lòng liên hê qua:

- Email: thinhdev6604@gmail.com
- Phone: 0967877911
- GitHub Issues: [Viet Restaurant Issues](https://github.com/tkynhdev/Viet_Restaurant/issues)

---

**Cám on ban dã su dung hê thong Viet Restaurant!** â¨ï¸
