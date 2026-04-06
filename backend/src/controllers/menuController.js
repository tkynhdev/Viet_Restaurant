const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Validate dữ liệu đầu vào (Cập nhật thêm model3dUrl)
const menuSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Tên món không được để trống' }),
    price: Joi.number().min(0).required().messages({ 'number.min': 'Giá phải lớn hơn 0' }),
    category: Joi.string().required(),
    isAvailable: Joi.alternatives().try(Joi.boolean(), Joi.string()).optional(), // Chấp nhận cả boolean hoặc string "true"/"false"
    model3dUrl: Joi.string().allow('', null).optional() // Chấp nhận chuỗi rỗng hoặc null
});

// 1. Lấy danh sách món
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await prisma.menu.findMany({
            orderBy: { id: 'desc' }
        });

        const menusWithImage = menus.map(item => ({
            ...item,
            // Tạo đường dẫn ảnh đầy đủ
            imageUrl: item.image ? `http://localhost:${process.env.PORT || 5000}/uploads/${item.image}` : null
        }));

        res.json(menusWithImage);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Thêm món mới (Có model3dUrl)
exports.createMenu = async (req, res) => {
    try {
        // Validate text trước
        const { error } = menuSchema.validate(req.body);
        if (error) {
            if (req.file) fs.unlinkSync(req.file.path); // Xóa ảnh nếu validate sai
            return res.status(400).json({ message: error.details[0].message });
        }

        // Lấy dữ liệu từ form
        const { name, price, category, isAvailable, model3dUrl } = req.body;

        // Lấy tên file ảnh nếu có upload
        const imageFilename = req.file ? req.file.filename : null;

        const newMenu = await prisma.menu.create({
            data: {
                name,
                price: parseFloat(price),
                category,
                isAvailable: isAvailable === 'true' || isAvailable === true,
                image: imageFilename,
                model3dUrl: model3dUrl || null // Lưu link 3D
            }
        });

        res.status(201).json({ message: 'Thêm món thành công', data: newMenu });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi tạo món' });
    }
};

// 3. Sửa món (Có model3dUrl)
exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, isAvailable, model3dUrl } = req.body;

        const existingMenu = await prisma.menu.findUnique({ where: { id: parseInt(id) } });
        if (!existingMenu) return res.status(404).json({ message: 'Món không tồn tại' });

        let imageFilename = existingMenu.image;

        // Nếu có upload ảnh mới
        if (req.file) {
            imageFilename = req.file.filename;
            // Xóa ảnh cũ
            if (existingMenu.image) {
                const oldPath = path.join(__dirname, '../../uploads', existingMenu.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseFloat(price),
                category,
                isAvailable: isAvailable === 'true' || isAvailable === true,
                image: imageFilename,
                model3dUrl: model3dUrl || null // Cập nhật link 3D
            }
        });

        res.json({ message: 'Cập nhật thành công', data: updatedMenu });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 4. Xóa món
exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await prisma.menu.findUnique({ where: { id: parseInt(id) } });

        if (!menu) return res.status(404).json({ message: 'Món không tồn tại' });

        if (menu.image) {
            const imagePath = path.join(__dirname, '../../uploads', menu.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await prisma.menu.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Xóa món thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Không thể xóa món này (có thể do đã có đơn hàng liên quan)' });
    }
};