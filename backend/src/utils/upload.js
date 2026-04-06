const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Lưu vào thư mục uploads ở gốc backend
    },
    filename: function (req, file, cb) {
        // Đổi tên file: thoi-gian-hien-tai + ten-goc (để tránh trùng lặp)
        // Ví dụ: 1715000000-pho-bo.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc: Chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ được phép upload file ảnh (jpeg, jpg, png, gif)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: fileFilter
});

module.exports = upload;