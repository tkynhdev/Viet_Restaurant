# --- STAGE 1: Build React App ---
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
# Cài đặt dependency
RUN npm install
# Copy code và Build
COPY . .
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
FROM nginx:alpine
# Copy file build từ Stage 1 sang thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]