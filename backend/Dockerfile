# 1. Dùng Node.js phiên bản nhẹ (Alpine)
FROM node:20-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package để cài thư viện trước (tận dụng cache)
COPY package*.json ./
RUN npm install

# 4. Copy toàn bộ code vào
COPY . .

# 5. Sinh Prisma Client (Bắt buộc)
RUN npx prisma generate

# 6. Mở cổng 5000
EXPOSE 5000

# 7. Lệnh chạy server
CMD ["npm", "run", "dev"]