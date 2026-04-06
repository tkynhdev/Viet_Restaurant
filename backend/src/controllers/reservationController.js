const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

const bookingSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    date: Joi.date().required(),
    people: Joi.number().min(1).required(),
    note: Joi.string().allow('').optional()
});

// 1. Khách tạo đơn đặt bàn
exports.createReservation = async (req, res) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, phone, date, people, note } = req.body;
        const userId = req.user ? req.user.id : null;

        const newBooking = await prisma.reservation.create({
            data: {
                name,
                phone,
                date: new Date(date),
                people: parseInt(people),
                note,
                userId,
                status: 'PENDING'
            }
        });

        // --- GỬI THÔNG BÁO SOCKET.IO ---
        const io = req.app.get('socketio');
        io.emit('new_reservation', newBooking); // Gửi sự kiện 'new_reservation'

        res.status(201).json({ message: 'Đặt bàn thành công!', data: newBooking });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Admin lấy danh sách đặt bàn
exports.getAllReservations = async (req, res) => {
    try {
        const list = await prisma.reservation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                orders: {
                    include: {
                        items: {
                            include: {
                                menu: true // <-- Đã giữ nguyên dòng bạn thêm
                            }
                        }
                    }
                }
            }
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Khách xem lịch sử đặt bàn của mình
exports.getMyReservations = async (req, res) => {
    try {
        const userId = req.user.id;
        const list = await prisma.reservation.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 4. Admin duyệt/hủy/hoàn tất đơn Đặt bàn & Đồng bộ sang Đơn hàng
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'CONFIRMED', 'REJECTED', 'COMPLETED'

        // 1. Cập nhật Reservation
        // Sửa: Gán vào biến updatedReservation để lấy userId
        const updatedReservation = await prisma.reservation.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        // --- [CODE THÊM VÀO] Gửi thông báo cho khách (nếu có userId) ---
        if (updatedReservation.userId) {
            const io = req.app.get('socketio');
            // Gửi sự kiện vào room riêng của user
            io.to(updatedReservation.userId.toString()).emit('reservation_status_updated', updatedReservation);
        }
        // -------------------------------------------------------------

        // 2. TỰ ĐỘNG ĐỒNG BỘ SANG ORDER (Giữ nguyên logic của bạn)
        let orderStatus = null;
        if (status === 'CONFIRMED') {
            orderStatus = 'CONFIRMED';
        } else if (status === 'REJECTED') {
            orderStatus = 'FAILED';
        } else if (status === 'COMPLETED') {
            orderStatus = 'COMPLETED';
        }

        if (orderStatus) {
            await prisma.order.updateMany({
                where: { reservationId: parseInt(id) },
                data: { status: orderStatus }
            });
        }

        res.json({ message: 'Cập nhật và đồng bộ thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};