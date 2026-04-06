import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

// Import file CSS tùy chỉnh
import './Kitchenpage.css';

const socket = io('http://localhost:5000');

const KitchenPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // 1. Tải danh sách đơn cần nấu
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // LỌC: Chỉ lấy đơn chưa hoàn tất và chưa hủy
            const kitchenOrders = res.data.filter(o =>
                ['PENDING', 'CONFIRMED', 'PAID', 'COOKING'].includes(o.orderStatus)
            );

            // SẮP XẾP: 
            // 1. Đang nấu (COOKING) lên đầu
            // 2. Đơn cũ nhất (CreatedAt nhỏ nhất) lên trước (FIFO)
            kitchenOrders.sort((a, b) => {
                if (a.orderStatus === 'COOKING' && b.orderStatus !== 'COOKING') return -1;
                if (a.orderStatus !== 'COOKING' && b.orderStatus === 'COOKING') return 1;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            setOrders(kitchenOrders);
        } catch (err) { console.error(err); }
    };

    // 2. Cập nhật trạng thái (Nấu / Xong)
    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${id}`, { orderStatus: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (status === 'COMPLETED') {
                toast.success('✅ Đã nấu xong! Món ăn đã ẩn khỏi màn hình.');
                setOrders(prev => prev.filter(o => o.id !== id));
            } else {
                toast.info('🔥 Đang nấu...');
                fetchOrders();
            }
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    // 3. Lắng nghe Socket
    useEffect(() => {
        fetchOrders();

        socket.on('new_order', () => {
            toast.info("🔔 Ting ting! Có đơn mới!");
            fetchOrders();
        });

        socket.on('order_updated', () => {
            fetchOrders();
        });

        return () => {
            socket.off('new_order');
            socket.off('order_updated');
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        // Sử dụng class .kitchen-layout thay vì style inline
        <div className="kitchen-layout">
            {/* Header */}
            <div className="kitchen-header d-flex justify-content-between align-items-center p-3 sticky-top">
                <div className="d-flex align-items-center">
                    <span className="fs-3 me-2">🔥</span>
                    <h3 className="header-title fw-bold text-warning m-0">KITCHEN DISPLAY</h3>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <Badge bg="secondary" className="p-2">
                        Đang chờ: {orders.filter(o => o.orderStatus !== 'COOKING').length}
                    </Badge>
                    <Badge bg="primary" className="p-2">
                        Đang nấu: {orders.filter(o => o.orderStatus === 'COOKING').length}
                    </Badge>
                    <Button variant="outline-light" size="sm" onClick={handleLogout}>Đăng xuất</Button>
                </div>
            </div>

            {/* Danh sách đơn */}
            <Container fluid className="p-4">
                <Row className="g-3">
                    {orders.length === 0 ? (
                        <div className="text-center mt-5 text-secondary">
                            {/* Class animation icon rỗng */}
                            <span className="empty-state-icon">👨‍🍳</span>
                            <h3>Bếp đang rảnh rỗi</h3>
                            <p>Chưa có đơn hàng mới...</p>
                        </div>
                    ) : (
                        orders.map(order => {
                            const isCooking = order.orderStatus === 'COOKING';
                            return (
                                <Col key={order.id} md={6} lg={4} xl={3}>
                                    {/* Class động dựa trên trạng thái */}
                                    <Card className={`order-card h-100 shadow-lg ${isCooking ? 'status-cooking' : 'status-pending'}`}>

                                        {/* Card Header */}
                                        <Card.Header className="card-header-custom fw-bold d-flex justify-content-between align-items-center">
                                            <div className="d-flex flex-column" style={{ lineHeight: '1.1' }}>
                                                <span className="fs-5">#{order.id}</span>
                                                <small style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                                    {order.table ? `Bàn: ${order.table.name}` : 'Chưa chọn bàn'}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <Badge bg="dark" style={{ fontSize: '0.7rem' }}>
                                                    {Math.floor((new Date() - new Date(order.createdAt)) / 60000)} phút trước
                                                </Badge>
                                            </div>
                                        </Card.Header>

                                        {/* Card Body */}
                                        <Card.Body>
                                            <ul className="list-unstyled mb-0 item-list">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="item-row mb-2 pb-2 d-flex justify-content-between align-items-start">
                                                        <span className="fw-bold">{item.menu.name}</span>
                                                        <span className={`badge rounded-pill qty-badge ${isCooking ? 'bg-light text-dark' : 'bg-dark'}`}>
                                                            x{item.quantity}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Ghi chú */}
                                            {order.reservation?.note && (
                                                <div className="mt-3 p-2 bg-danger text-white rounded fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    ⚠️ Note: {order.reservation.note}
                                                </div>
                                            )}

                                            {/* Trạng thái thanh toán */}
                                            <div className="mt-2 text-end">
                                                {order.paymentStatus === 'PAID'
                                                    ? <Badge bg="success">Đã trả tiền</Badge>
                                                    : <Badge bg="secondary">Chưa trả tiền</Badge>
                                                }
                                            </div>
                                        </Card.Body>

                                        {/* Card Footer (Actions) */}
                                        <Card.Footer className="border-0 bg-transparent pb-3 pt-0">
                                            {isCooking ? (
                                                <Button
                                                    variant="success"
                                                    className="action-btn w-100 shadow"
                                                    onClick={() => updateStatus(order.id, 'COMPLETED')}
                                                >
                                                    ✅ HOÀN TẤT (XONG)
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    className="action-btn w-100 shadow"
                                                    onClick={() => updateStatus(order.id, 'COOKING')}
                                                >
                                                    🔥 BẮT ĐẦU NẤU
                                                </Button>
                                            )}
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default KitchenPage;