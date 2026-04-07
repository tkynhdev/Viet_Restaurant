# Cloudinary Setup Instructions

## 1. Get Cloudinary Credentials
1. Sign up at https://cloudinary.com
2. Go to Dashboard -> Account Details
3. Copy:
   - Cloud Name
   - API Key  
   - API Secret

## 2. Update .env file
Add these variables to your `backend/.env` file:

```env
# CLOUDINARY CONFIG
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 3. What We've Changed

### Backend Changes:
- **Installed packages**: `cloudinary` and `multer-storage-cloudinary`
- **Created**: `backend/config/cloudinary.js` - Cloudinary configuration
- **Updated**: `backend/src/utils/upload.js` - Now uploads directly to Cloudinary
- **Updated**: `backend/src/controllers/menuController.js` - Saves Cloudinary URLs instead of local filenames
- **Updated**: `backend/src/app.js` - Removed static file serving for local uploads
- **Updated**: `backend/.env.example` - Added Cloudinary environment variables

### Frontend:
- **No changes needed** - Frontend already uses `item.imageUrl` which will now contain complete Cloudinary URLs

## 4. How It Works Now

### Before (Local Storage):
```
Upload -> Local file -> Save filename -> Frontend: http://localhost:5000/uploads/filename.jpg
```

### After (Cloudinary):
```
Upload -> Cloudinary -> Save full URL -> Frontend: https://res.cloudinary.com/your-cloud/viet-restaurant/image.jpg
```

## 5. Benefits
- **Persistent storage**: Images won't be deleted when server restarts
- **CDN delivery**: Faster image loading globally
- **Automatic optimization**: Cloudinary optimizes images automatically
- **No storage limits**: No need to manage server disk space
- **Better performance**: Offloads image processing from your server

## 6. Testing
Once you add your Cloudinary credentials to `.env`, test by:
1. Starting the backend server
2. Adding a new menu item with image upload
3. Check that the image displays correctly in frontend
4. Verify the image URL in database is a Cloudinary URL
