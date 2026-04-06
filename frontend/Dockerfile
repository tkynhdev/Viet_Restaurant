# ============================================
# Development Stage (Hot Reload)
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài thư viện
RUN npm install

# Copy source code
COPY . .

# Expose port Vite
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173 || exit 1

# Chạy Vite dev server (với host 0.0.0.0 để accessible từ ngoài container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]