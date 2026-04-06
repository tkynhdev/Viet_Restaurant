const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const http = require('http'); // 1. Import module http
const { Server } = require("socket.io"); // 2. Import Socket.IO

// Load cấu hình
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
// --- CẤU HÌNH SOCKET.IO ---
const server = http.createServer(app); // 3. Tạo http server từ app của Express
const io = new Server(server, { // 4. Khởi tạo Socket.IO server
    cors: {
        origin: "http://localhost:5173", // Cho phép frontend ở cổng 5173 kết nối
        methods: ["GET", "POST"]
    }
});

// 5. [QUAN TRỌNG NHẤT] Gắn `io` vào đối tượng `app` để các controller có thể dùng
app.set('socketio', io);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
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

    // Lắng nghe sự kiện "join_room" từ user
    socket.on('join_room', (userId) => {
        socket.join(userId.toString()); // Cho user vào phòng riêng có tên là ID của họ
        console.log(`User ${userId} đã vào phòng riêng.`);
    });

    socket.on('disconnect', () => {
        console.log(' Client đã ngắt kết nối:', socket.id);
    });
});

// --- CHẠY SERVER ---
// 6. Dùng `server.listen` thay vì `app.listen` cũ
server.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(` Server đang chạy tại: http://localhost:${PORT}`);
    console.log(` Socket.IO đang lắng nghe...`);
    console.log(`-----------------------------------------------`);
});