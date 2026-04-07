const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const { cloudinary } = require('../../config/cloudinary');

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

        // For Cloudinary, image field already contains the full URL
        // No need to construct URL prefix
        const menusWithImage = menus.map(item => ({
            ...item,
            imageUrl: item.image || null // Cloudinary URL is already complete
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
            // Delete uploaded file from Cloudinary if validation fails
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({ message: error.details[0].message });
        }

        // Lấy dữ liệu từ form
        const { name, price, category, isAvailable, model3dUrl } = req.body;

        // Lấy Cloudinary URL nếu có upload
        const imageUrl = req.file ? req.file.path : null; // Cloudinary provides full URL in req.file.path

        const newMenu = await prisma.menu.create({
            data: {
                name,
                price: parseFloat(price),
                category,
                isAvailable: isAvailable === 'true' || isAvailable === true,
                image: imageUrl, // Save Cloudinary URL directly
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

        let imageUrl = existingMenu.image;

        // Nếu có upload ảnh mới
        if (req.file) {
            imageUrl = req.file.path; // Cloudinary URL
            
            // Delete old image from Cloudinary if exists
            if (existingMenu.image) {
                try {
                    // Extract public_id from Cloudinary URL
                    const publicId = existingMenu.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`viet-restaurant/${publicId}`);
                } catch (deleteError) {
                    console.log('Failed to delete old image from Cloudinary:', deleteError);
                }
            }
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseFloat(price),
                category,
                isAvailable: isAvailable === 'true' || isAvailable === true,
                image: imageUrl, // Save Cloudinary URL directly
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

        // Delete image from Cloudinary if exists
        if (menu.image) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = menu.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`viet-restaurant/${publicId}`);
            } catch (deleteError) {
                console.log('Failed to delete image from Cloudinary:', deleteError);
            }
        }

        await prisma.menu.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Xóa món thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Không thể xóa món này (có thể do đã có đơn hàng liên quan)' });
    }
};