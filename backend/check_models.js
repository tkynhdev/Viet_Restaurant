// filepath: c:\do_an_chuyen_nganh\backend\check_models.js
const axios = require('axios');
require('dotenv').config(); // Đảm bảo load .env

// --- SỬ DỤNG process.env THAY VÌ HARDCODE ---
const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
    if (!API_KEY) {
        console.log("❌ LỖI: Thiếu GEMINI_API_KEY trong .env!");
        return;
    }
    console.log("⏳ Đang kết nối Google để kiểm tra quyền hạn của Key...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);
        console.log("\n✅ KẾT NỐI THÀNH CÔNG! Dưới đây là các model bạn ĐƯỢC PHÉP dùng:");
        console.log("-------------------------------------------------------------");

        const models = response.data.models || [];
        let foundFlash = false;

        models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                const shortName = m.name.replace("models/", "");
                console.log(`🔹 ${shortName}`);
                if (shortName.includes("gemini-1.5-flash")) foundFlash = true;
            }
        });

        console.log("-------------------------------------------------------------");
        if (foundFlash) {
            console.log("🎉 TUYỆT VỜI: Key này CÓ QUYỀN dùng 'gemini-1.5-flash'.");
            console.log("👉 Lỗi của bạn chắc chắn do file .env hoặc code sai chỗ khác.");
        } else {
            console.log("⚠️ CẢNH BÁO: Key này KHÔNG THẤY model 'gemini-1.5-flash'.");
            console.log("👉 Hãy dùng một trong các tên model hiện ở trên để thay vào code.");
        }

    } catch (error) {
        console.log("\n❌ KẾT NỐI THẤT BẠI:");
        if (error.response) {
            console.log(`- Lỗi HTTP: ${error.response.status} ${error.response.statusText}`);
            console.log(`- Chi tiết: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`- Lỗi: ${error.message}`);
        }
        console.log("\n👉 Gợi ý: Nếu lỗi 400/403 -> Key sai hoặc Project bị khóa/chưa bật Billing.");
    }
}

checkModels();