const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Lấy danh sách bàn
exports.getTables = async (req, res) => {
    try {
        const tables = await prisma.table.findMany({ orderBy: { name: 'asc' } });
        res.json(tables);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách bàn' });
    }
};

// 2. Thêm bàn mới (Đã có validate)
exports.createTable = async (req, res) => {
    try {
        const { name, capacity } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Tên bàn không được để trống.' });
        }

        const existingTable = await prisma.table.findUnique({
            where: { name: name.trim() }
        });
        if (existingTable) {
            return res.status(400).json({ message: 'Tên bàn này đã tồn tại!' });
        }

        const newTable = await prisma.table.create({
            data: {
                name: name.trim(),
                capacity: parseInt(capacity) || 4,
                status: 'EMPTY'
            }
        });

        const io = req.app.get('socketio');
        io.emit('table_status_updated', newTable);
        res.status(201).json(newTable);
    } catch (err) {
        console.error("Lỗi tạo bàn:", err);
        res.status(500).json({ message: 'Lỗi server không xác định khi tạo bàn.' });
    }
};

// 3. Cập nhật trạng thái bàn
exports.updateTableStatus = async (req, res) => {
    try {
        const tableId = parseInt(req.params.id);
        const { status } = req.body;

        const updatedTable = await prisma.table.update({
            where: { id: tableId },
            data: { status }
        });

        if (status === 'EMPTY') {
            await prisma.order.updateMany({
                where: { tableId: tableId },
                data: { tableId: null }
            });
        }

        const io = req.app.get('socketio');
        io.emit('table_status_updated', updatedTable);
        io.emit('force_refetch_orders');

        res.json({ message: "Cập nhật thành công", data: updatedTable });
    } catch (err) {
        console.error("Lỗi cập nhật trạng thái bàn:", err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật bàn' });
    }
};

// 4. Xóa bàn
exports.deleteTable = async (req, res) => {
    try {
        const tableId = parseInt(req.params.id);

        // Kiểm tra xem bàn có đang được sử dụng không
        const ordersOnTable = await prisma.order.count({ where: { tableId: tableId } });
        if (ordersOnTable > 0) {
            return res.status(400).json({ message: 'Không thể xóa bàn đang có đơn hàng.' });
        }

        await prisma.table.delete({ where: { id: tableId } });

        const io = req.app.get('socketio');
        io.emit('table_deleted', { id: tableId });

        res.json({ message: 'Đã xóa bàn' });
    } catch (err) {
        console.error("Lỗi xóa bàn:", err);
        res.status(500).json({ message: 'Không thể xóa (bàn có thể đang liên kết với các đơn hàng cũ)' });
    }
}