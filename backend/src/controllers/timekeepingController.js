const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Nhân viên chấm công
exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { location } = req.body;

        // Logic kiểm tra đi muộn (Ví dụ: sau 8h30 là muộn)
        const now = new Date();
        const startWork = new Date();
        startWork.setHours(8, 30, 0); // 8:30 AM
        const status = now > startWork ? 'LATE' : 'ON_TIME';

        const newRecord = await prisma.timekeeping.create({
            data: {
                userId,
                location,
                status
            },
            include: { user: true }
        });

        // Gửi thông báo cho Admin qua Socket
        const io = req.app.get('socketio');
        io.emit('new_checkin', newRecord);

        res.json({ message: "Chấm công thành công", data: newRecord });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Admin xem lịch sử chấm công
exports.getAllTimelogs = async (req, res) => {
    try {
        const logs = await prisma.timekeeping.findMany({
            orderBy: { checkIn: 'desc' },
            include: { user: true }
        });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};