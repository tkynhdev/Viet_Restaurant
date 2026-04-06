# ============================================
# Build Stage: Chuẩn bị dependencies
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài thư viện
RUN npm install

# ============================================
# Production Stage: Chạy server
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copy từ builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check (kiểm tra server hoạt động)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/api/menu || exit 1

# Sinh Prisma Client + Chạy migrations + Start server
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --skip-generate && npm run dev"]