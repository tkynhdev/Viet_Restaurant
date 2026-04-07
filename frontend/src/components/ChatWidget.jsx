import { useState, useRef, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Em là trợ lý ảo AI. Em có thể giúp anh/chị chọn món hoặc đặt bàn ạ! 👋' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // --- THÊM STATE ĐỂ LƯU MENU THẬT ---
    const [menuList, setMenuList] = useState([]);

    const { addToCart } = useCart();
    const messagesEndRef = useRef(null);

    const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";

    // Lấy Session ID
    useEffect(() => {
        let id = localStorage.getItem('chatSessionId');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('chatSessionId', id);
        }
        setSessionId(id);
    }, []);

    // --- THÊM: LẤY MENU VỀ ĐỂ ĐỐI CHIẾU KHI BOT GỌI MÓN ---
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/menu`);
                setMenuList(res.data);
            } catch (err) { console.error("Lỗi load menu chat:", err); }
        };
        fetchMenu();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
                message: userMsg,
                sessionId: sessionId
            });

            let replyText = res.data.reply;

            // --- LOGIC XỬ LÝ JSON THÔNG MINH ---
            try {
                // 1. Tìm chuỗi JSON ẩn trong lời nói của AI (Bắt đầu bằng { action: "ADD_TO_CART" ... })
                const jsonMatch = replyText.match(/\{[\s\S]*"action":\s*"ADD_TO_CART"[\s\S]*\}/);

                if (jsonMatch) {
                    const jsonString = jsonMatch[0];
                    const actionData = JSON.parse(jsonString);

                    if (actionData.items && Array.isArray(actionData.items)) {
                        let addedCount = 0;

                        // Duyệt qua từng món AI gợi ý
                        actionData.items.forEach(aiItem => {
                            // Tìm món trong Menu thật của quán (so khớp tên gần đúng)
                            const foundDish = menuList.find(m =>
                                m.name.toLowerCase().includes(aiItem.name.toLowerCase()) ||
                                aiItem.name.toLowerCase().includes(m.name.toLowerCase())
                            );

                            if (foundDish) {
                                // Thêm vào giỏ hàng thật
                                const qty = aiItem.quantity || 1;
                                for (let i = 0; i < qty; i++) addToCart(foundDish);
                                addedCount += qty;
                            }
                        });

                        if (addedCount > 0) {
                            toast.success(`Bot đã thêm ${addedCount} món vào giỏ!`);
                            // Xóa đoạn JSON loằng ngoằng khỏi tin nhắn hiển thị
                            replyText = replyText.replace(jsonString, '').trim();

                            // Nếu xóa xong mà hết chữ, thì thêm câu mặc định
                            if (!replyText) replyText = "Dạ, em đã thêm món vào giỏ hàng rồi ạ! Anh/chị kiểm tra nhé. 🛒";
                        }
                    }
                }
            } catch (parseError) {
                // Nếu lỗi parse hoặc không có JSON thì bỏ qua, in text bình thường
            }

            setMessages(prev => [...prev, { sender: 'bot', text: replyText }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Hệ thống đang bận, vui lòng thử lại sau ạ.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chat-widget-wrapper">

            {/* --- KHỐI LIÊN HỆ BỔ SUNG (GIỮ NGUYÊN) --- */}
            <div className={`contact-stack ${isOpen ? 'shifted' : ''}`}>
                <a href="https://m.me/thinhkakakaka" target="_blank" rel="noreferrer" className="contact-btn btn-messenger" title="Chat Messenger">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" />
                </a>
                <a href="https://zalo.me/0967877911" target="_blank" rel="noreferrer" className="contact-btn btn-zalo" title="Chat Zalo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png" alt="Zalo" />
                </a>
                <a href="tel:0967877911" className="contact-btn btn-phone" title="Gọi ngay">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.49-5.15-3.8-6.62-6.62l1.97-1.57c.23-.24.31-.56.25-.87-.36-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3.46 3 3.93 3 5.46c0 9.71 7.89 17.6 17.6 17.6 1.52 0 1.99-.65 1.99-1.19v-3.81c0-.54-.45-.99-.99-.99z" /></svg>
                </a>
            </div>

            {/* --- CHATBOT WINDOW (GIỮ NGUYÊN) --- */}
            <div className={`chat-window ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="bot-avatar-header">
                            <img src={BOT_AVATAR} alt="Bot" />
                        </div>
                        <div className="header-text">
                            <strong>Trợ lý ảo AI</strong>
                            <span className="status-dot">Online</span>
                        </div>
                    </div>
                    <button className="btn-close-chat" onClick={() => setIsOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="chat-body">
                    {messages.map((msg, index) => (
                        <div key={index} className={`msg-row ${msg.sender}`}>
                            {msg.sender === 'bot' && <img src={BOT_AVATAR} className="bot-avatar-msg" alt="Bot" />}
                            <div className={`msg-bubble ${msg.sender}`}>{msg.text}</div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="msg-row bot">
                            <img src={BOT_AVATAR} className="bot-avatar-msg" alt="Bot" />
                            <div className="msg-bubble bot typing">
                                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-footer">
                    <Form onSubmit={handleSend} className="w-100">
                        <InputGroup className="chat-input-group">
                            <Form.Control className="chat-input" placeholder="Hỏi món ăn, đặt bàn..." value={input} onChange={e => setInput(e.target.value)} />
                            <Button className="btn-send-chat" type="submit" disabled={isTyping}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </Button>
                        </InputGroup>
                    </Form>
                </div>
            </div>

            {/* NÚT MỞ CHATBOT (GIỮ NGUYÊN) */}
            <button
                className={`chat-toggle-btn ${isOpen ? 'hide' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                <span className="chat-notification-badge">1</span>
            </button>
        </div>
    );
};

export default ChatWidget;