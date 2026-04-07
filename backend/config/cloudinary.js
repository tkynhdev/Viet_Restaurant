const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'viet-restaurant', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `menu-${uniqueSuffix}`;
    },
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Resize to max 800x600
      { quality: 'auto' }, // Auto optimize quality
      { fetch_format: 'auto' } // Auto format (webp, etc)
    ]
  }
});

module.exports = {
  cloudinary,
  storage
};
