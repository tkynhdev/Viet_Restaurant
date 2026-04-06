const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Tạo đơn hàng (Khách đặt - Có hỗ trợ VNPAY/Tiền mặt/Đặt bàn)
exports.createOrder = async (req, res) => {
    try {
        const { cartItems, totalPrice, bookingInfo, paymentMethod } = req.body;

        // Lấy userId nếu có (từ middleware)
        const userId = req.user ? req.user.id : null;

        // Chuẩn bị cú pháp kết nối Prisma
        const userConnect = userId ? { connect: { id: userId } } : undefined;

        // Chuẩn bị dữ liệu đặt bàn (Reservation) nếu có
        let reservationData = undefined;
        if (bookingInfo && bookingInfo.date) {
            reservationData = {
                create: {
                    name: bookingInfo.name,
                    phone: bookingInfo.phone,
                    date: new Date(bookingInfo.date),
                    people: parseInt(bookingInfo.people),
                    note: bookingInfo.note,
                    status: 'PENDING',
                    user: userConnect
                }
            };
        }

        // Tạo Order trong Database
        const newOrder = await prisma.order.create({
            data: {
                totalPrice: parseFloat(totalPrice),
                paymentStatus: 'UNPAID',  // Mặc định chưa thanh toán
                orderStatus: 'PENDING',   // Mặc định chờ xử lý
                paymentMethod: paymentMethod || 'CASH',
                user: userConnect,

                // Tạo chi tiết món ăn (OrderItems)
                items: {
                    create: cartItems.map(item => ({
                        menuId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                },

                // Tạo đặt bàn kèm theo (nếu có)
                reservation: reservationData
            },
            // Include để lấy dữ liệu trả về ngay lập tức
            include: {
                reservation: true,
                user: true,
                table: true,
                items: { include: { menu: true } }
            }
        });

        // --- Gửi thông báo Real-time ---
        const io = req.app.get('socketio');

        // 1. Báo cho Admin quản lý đơn
        io.emit('new_order', newOrder);

        // 2. Báo cho Admin quản lý đặt bàn (nếu có)
        if (newOrder.reservation) {
            io.emit('new_reservation', newOrder.reservation);
        }

        res.status(201).json(newOrder);

    } catch (err) {
        console.error("Lỗi tạo đơn:", err);
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
};

// 2. [KHÁCH] Xem lịch sử đơn hàng của tôi
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { menu: true } },
                payments: true,
                reservation: true
            }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn' });
    }
};

// 3. [ADMIN/STAFF] Lấy tất cả đơn hàng (Đây là hàm bạn đang thiếu)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                items: { include: { menu: true } },
                reservation: true,
                payments: true,
                table: true
            }
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn' });
    }
};

// 4. [ADMIN/STAFF] Cập nhật trạng thái đơn & Đồng bộ Reservation
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, orderStatus } = req.body;

        // Chỉ cập nhật những trường được gửi lên
        let dataToUpdate = {};
        if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
        if (orderStatus) dataToUpdate.orderStatus = orderStatus;

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'Không có trạng thái nào được gửi lên.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
            include: { user: true, reservation: true, table: true, items: { include: { menu: true } } }
        });

        const io = req.app.get('socketio');

        // Gửi thông báo cho Admin/Bếp để cập nhật giao diện
        io.emit('order_updated', updatedOrder);

        // Gửi thông báo riêng cho Khách hàng (nếu đơn có chủ)
        if (updatedOrder.userId) {
            io.to(updatedOrder.userId.toString()).emit('order_status_updated', updatedOrder);
        }

        // --- Logic Đồng bộ sang Reservation (Đặt bàn) ---
        if (updatedOrder.reservationId) {
            let reservationStatus = null;

            // Nếu đã thanh toán HOẶC bếp đang nấu/xong -> Xác nhận đặt bàn
            if (updatedOrder.paymentStatus === 'PAID' || ['CONFIRMED', 'COOKING', 'COMPLETED'].includes(updatedOrder.orderStatus)) {
                reservationStatus = 'CONFIRMED';
            }
            // Nếu đơn bị hủy -> Hủy đặt bàn
            else if (updatedOrder.orderStatus === 'FAILED') {
                reservationStatus = 'REJECTED';
            }

            if (reservationStatus) {
                const updatedRes = await prisma.reservation.update({
                    where: { id: updatedOrder.reservationId },
                    data: { status: reservationStatus }
                });
                // Báo cho trang Quản lý đặt bàn biết
                io.emit('reservation_status_updated', updatedRes);
            }
        }

        res.json({ message: 'Cập nhật thành công', data: updatedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi cập nhật đơn hàng' });
    }
};

// 5. [ADMIN/STAFF] Xếp bàn cho đơn hàng
exports.assignTableToOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { tableId } = req.body;

        // 1. Cập nhật Order
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { tableId: parseInt(tableId) },
            include: { table: true, user: true, reservation: true, items: { include: { menu: true } } }
        });

        // 2. Cập nhật Table -> OCCUPIED
        const updatedTable = await prisma.table.update({
            where: { id: parseInt(tableId) },
            data: { status: 'OCCUPIED' }
        });

        // 3. Gửi Socket
        const io = req.app.get('socketio');
        io.emit('table_status_updated', updatedTable); // Cập nhật sơ đồ bàn
        io.emit('order_updated', updatedOrder); // Cập nhật danh sách đơn

        res.json({ message: 'Xếp bàn thành công!', data: updatedOrder });
    } catch (err) {
        console.error("Lỗi khi xếp bàn:", err);
        res.status(500).json({ message: 'Lỗi server khi xếp bàn' });
    }
};