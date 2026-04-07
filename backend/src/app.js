// filepath: c:\do_an_chuyen_nganh\backend\src\app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const rateLimit = require('express-rate-limit'); // Thêm import

dotenv.config();

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const timekeepingRoutes = require('./routes/timekeepingRoutes');

// --- CẤU HÌNH RATE LIMITING ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn 100 request/IP
    message: 'Quá nhiều request từ IP này, thử lại sau.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit đặc biệt cho AI (chống spam Gemini)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 10, // Chỉ 10 request/phút cho AI
    message: 'Quá nhiều request AI, thử lại sau.',
});

// Rate limit đặc biệt cho Payment (chống spam thanh toán)
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 5, // Chỉ 5 request/phút cho thanh toán
    message: 'Quá nhiều request thanh toán, thử lại sau.',
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "http://localhost:5173", // Sử dụng env cho production
        methods: ["GET", "POST", "PUT", "DELETE"], // Thêm PUT, DELETE
        credentials: true // Cho phép cookie nếu cần
    }
});

app.set('socketio', io);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiter); // Áp dụng rate limit chung

// --- STATIC FILES ---
// Note: No longer serving local uploads folder as we now use Cloudinary
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiLimiter, aiRoutes); // Thêm aiLimiter cho AI
app.use('/api/payment', paymentLimiter, paymentRoutes); // Thêm paymentLimiter cho Payment
app.use('/api/timekeeping', timekeepingRoutes);

// --- XỬ LÝ KẾT NỐI SOCKET.IO ---
io.on('connection', (socket) => {
    console.log(' Một client Admin đã kết nối vào Socket.IO:', socket.id);

    socket.on('disconnect', () => {
        console.log(' Client Admin đã ngắt kết nối:', socket.id);
    });
});
io.on('connection', (socket) => {
    console.log(' Một client đã kết nối:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(' Client đã ngắt kết nối:', socket.id);
    });
});

// --- CHẠY SERVER ---
server.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(` Server đang chạy tại: http://localhost:${PORT}`);
    console.log(` Socket.IO đang lắng nghe...`);
    console.log(`-----------------------------------------------`);
});