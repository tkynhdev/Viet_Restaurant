-- File này sẽ chạy tự động lần đầu Docker khởi động DB

-- Tạo database (nếu chưa tồn tại)
CREATE DATABASE IF NOT EXISTS restaurant_db;

-- Cho phép user truy cập
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'%';
FLUSH PRIVILEGES;

-- Log
SELECT 'Database restaurant_db initialized successfully!' as status;
