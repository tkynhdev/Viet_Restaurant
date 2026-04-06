const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const prisma = new PrismaClient();

const loginSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required()
});

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existUser = await prisma.user.findUnique({ where: { username } });
        if (existUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: { username, password: hashedPassword, role: 'CUSTOMER' }
        });

        res.status(201).json({ message: 'Đăng ký thành công! Hãy đăng nhập.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    }
};

exports.login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ message: 'Tên đăng nhập không tồn tại!' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...userData } = user;
        res.json({ message: 'Đăng nhập thành công', token, user: userData });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password: _, ...userData } = user;
        res.json(userData);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.loginGoogle = async (req, res) => {
    try {
        const { email, username, photo } = req.body;
        let user = await prisma.user.findUnique({ where: { email: email } });

        if (!user) {
            const checkUsername = await prisma.user.findUnique({ where: { username } });
            const finalUsername = checkUsername ? `${username}${Math.floor(Math.random() * 1000)}` : username;

            user = await prisma.user.create({
                data: {
                    username: finalUsername,
                    email: email,
                    password: null,
                    role: 'CUSTOMER'
                }
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Đăng nhập Google thành công',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi xử lý Google Login' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'TK Google không đổi mật khẩu được.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const exist = await prisma.user.findUnique({ where: { username } });
        if (exist) return res.status(400).json({ message: 'Tên đã tồn tại' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: { username, password: hash, role }
        });

        res.status(201).json({ message: `Tạo tài khoản ${role} thành công!` });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// --- [HÀM MỚI] ĐĂNG KÝ KHUÔN MẶT ---
exports.registerFace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceData } = req.body; // Mảng số (Descriptor)

        if (!faceData) return res.status(400).json({ message: "Thiếu dữ liệu khuôn mặt" });

        await prisma.user.update({
            where: { id: userId },
            data: { faceData: faceData } // Lưu mảng số vào cột Json
        });

        res.json({ message: "Đăng ký khuôn mặt thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi lưu khuôn mặt" });
    }
};