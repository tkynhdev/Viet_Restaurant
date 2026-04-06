const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Joi = require('joi'); // Thêm import

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Schema validation cho chat
const chatSchema = Joi.object({
    message: Joi.string().min(1).max(500).required().messages({
        'string.empty': 'Tin nhắn không được rỗng',
        'string.max': 'Tin nhắn quá dài'
    }),
    sessionId: Joi.string().uuid().required()
});

exports.chat = async (req, res) => {
    try {
        const { error } = chatSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { message, sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ reply: "Lỗi: Thiếu sessionId." });
        }

        // --- 1. LẤY HOẶC TẠO PHIÊN CHAT ---
        let session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });

        let history = [];
        if (session) {
            history = session.history;
        }

        // --- 2. LẤY KIẾN THỨC NỀN (Được phân loại rõ ràng hơn) ---
        const allMenus = await prisma.menu.findMany({ where: { isAvailable: true } });

        // Tách đồ ăn và đồ uống để AI dễ tư vấn upselling
        const foods = allMenus.filter(m => m.category === 'DoAn').map(m => `- ${m.name} (${m.price.toLocaleString()}đ)`).join('\n');
        const drinks = allMenus.filter(m => m.category === 'DoUong').map(m => `- ${m.name} (${m.price.toLocaleString()}đ)`).join('\n');

        const systemInstruction = `
            BẠN LÀ: "Bếp Trưởng AI" của nhà hàng VIET RESTAURANT.
            TÍNH CÁCH: Thân thiện, nhiệt tình, hay dùng emoji 🍜🍹.

            NHIỆM VỤ:
            1. Trả lời thắc mắc về thực đơn, giá cả, địa chỉ.
            2. **BÁN THÊM (UPSELLING):** Nếu khách gọi đồ ăn, hãy khéo léo gợi ý thêm đồ uống. Nếu gọi đồ uống, gợi ý thêm món ăn nhẹ.
            3. Nếu khách hỏi món không có: Xin lỗi và gợi ý món tương tự đang có trong menu.

            THÔNG TIN NHÀ HÀNG:
            - Địa chỉ: Hutech Khu Công Nghệ Cao, Quận 9, TP.HCM.
            - Giờ mở cửa: 06:30 - 22:00.

            THỰC ĐƠN HÔM NAY:
            --- ĐỒ ĂN ---
            ${foods}
            --- ĐỒ UỐNG ---
            ${drinks}

            QUY TẮC XỬ LÝ ĐƠN HÀNG (JSON):
            - Nếu khách thể hiện ý định muốn gọi món (ví dụ: "Cho tôi 1 phở", "Lấy 2 trà đá"), hãy trả lời bằng định dạng JSON thuần túy như sau:
            {"action": "ADD_TO_CART", "items": [{"name": "Tên món chính xác trong menu", "quantity": Số lượng}]}
            
            - Nếu không phải gọi món, hãy trả lời bằng văn bản bình thường.
        `;

        // --- 3. KHỞI TẠO GEMINI ---
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.3, // Thấp để bám sát thực tế
                maxOutputTokens: 500,
            }
        });


        const chat = model.startChat({ history: history });

        // --- 4. GỬI TIN NHẮN ---
        const result = await chat.sendMessage(message);
        const response = await result.response;
        let replyText = response.text();

        // --- XỬ LÝ LỖI JSON MARKDOWN (Quan trọng) ---
        // Gemini hay trả về ```json ... ```, ta cần xóa nó đi để Frontend parse được
        if (replyText.includes('```json')) {
            replyText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (replyText.includes('```')) {
            replyText = replyText.replace(/```/g, '').trim();
        }

        // --- 5. CẬP NHẬT LỊCH SỬ ---
        const newHistory = [
            ...history,
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: replyText }] }
        ];

        // Giới hạn lịch sử để tránh lỗi quá tải token (giữ 20 tin gần nhất)
        if (newHistory.length > 20) newHistory.splice(0, newHistory.length - 20);

        await prisma.chatSession.upsert({
            where: { id: sessionId },
            update: { history: newHistory },
            create: { id: sessionId, history: newHistory }
        });

        res.json({ reply: replyText });

    } catch (err) {
        console.error("Lỗi AI Controller:", err);
        res.status(500).json({ reply: "Xin lỗi, Bếp trưởng đang bận chút xíu, bạn thử lại sau nhé! 👨‍🍳" });
    }
};