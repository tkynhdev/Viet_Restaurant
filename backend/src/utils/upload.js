const multer = require('multer');
const path = require('path');
const { storage } = require('../../config/cloudinary');

// CLOUDINARY STORAGE - Upload directly to Cloudinary instead of local storage
// Storage configuration is now imported from cloudinary.js

// Filter: Chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ được phép upload file ảnh (jpeg, jpg, png, gif, webp)!'));
    }
};

const upload = multer({
    storage: storage, // Use Cloudinary storage
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: fileFilter
});

module.exports = upload;