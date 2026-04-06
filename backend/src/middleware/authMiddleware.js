const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token không hợp lệ.' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'ADMIN') next();
        else res.status(403).json({ message: 'Bạn không phải Admin!' });
    });
};

// --- QUAN TRỌNG: Phải có hàm này ---
const verifyStaff = (req, res, next) => {
    verifyToken(req, res, () => {
        if (['ADMIN', 'CASHIER', 'CHEF', 'STAFF'].includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền nhân viên!' });
        }
    });
};

const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) { next(); }
};

module.exports = { verifyToken, verifyAdmin, verifyStaff, optionalVerifyToken };