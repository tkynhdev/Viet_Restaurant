const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay, parseISO, isValid } = require('date-fns');

// 1. Báo cáo doanh thu (Đã thêm check ngày hợp lệ)
exports.getRevenueReport = async (req, res) => {
    try {
        const { from, to } = req.query;

        const startDate = from ? parseISO(from) : new Date();
        const endDate = to ? parseISO(to) : new Date();

        // Kiểm tra xem ngày có hợp lệ không
        if (!isValid(startDate) || !isValid(endDate)) {
            return res.status(400).json({ message: 'Định dạng ngày không hợp lệ.' });
        }

        // Chỉ tính các đơn đã thanh toán hoặc hoàn tất
        const orders = await prisma.order.findMany({
            where: {
                paymentStatus: 'PAID', // Chỉ tính đơn đã trả tiền
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
            },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        res.json({
            totalRevenue,
            totalOrders: orders.length,
            startDate: from,
            endDate: to
        });

    } catch (err) {
        console.error("Lỗi báo cáo doanh thu:", err);
        res.status(500).json({ message: 'Lỗi server khi tính doanh thu' });
    }
};

// 2. Báo cáo Top món (Sửa lại để an toàn hơn)
exports.getTopSellingDishes = async (req, res) => {
    try {
        const topDishes = await prisma.orderItem.groupBy({
            by: ['menuId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            // take: 5
        });

        // Lấy thông tin chi tiết của các món
        // Lấy thông tin chi tiết
        const menuIds = topDishes.map(item => item.menuId);
        const menus = await prisma.menu.findMany({
            where: { id: { in: menuIds } }
        });

        const result = topDishes.map(item => {
            const menu = menus.find(m => m.id === item.menuId);
            return {
                name: menu ? menu.name : 'Món không tồn tại',
                totalSold: item._sum.quantity || 0
            };
        });

        res.json(result);
    } catch (err) {
        console.error("Lỗi báo cáo món:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách món' });
    }
}