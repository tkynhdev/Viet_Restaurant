import { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Row, Col, Tab, Tabs, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ProfilePage.css';

const socket = io('http://localhost:5000');

const ProfilePage = () => {
    const [myBookings, setMyBookings] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // State cho Modal đổi mật khẩu
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '', newPassword: '', confirmPassword: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const resBooking = await axios.get('http://localhost:5000/api/reservations/mine', config);
            setMyBookings(resBooking.data);
            const resOrder = await axios.get('http://localhost:5000/api/orders/mine', config);
            setMyOrders(resOrder.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();

        if (user && user.id) {
            socket.emit('join_room', user.id);

            const handleUpdate = () => {
                toast.info(`🔔 Trạng thái đơn hàng/đặt bàn của bạn đã được cập nhật!`);
                fetchData();
            };

            socket.on('order_status_updated', handleUpdate);
            socket.on('reservation_status_updated', handleUpdate);

            return () => {
                socket.off('order_status_updated', handleUpdate);
                socket.off('reservation_status_updated', handleUpdate);
            };
        }
    }, [user.id]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Mật khẩu mới không khớp!');
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/change-password',
                { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Đổi mật khẩu thành công!');
            setShowChangePasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleInputChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    return (
        <div className="profile-page-wrapper">
            {/* Header */}
            <div className="profile-header">
                <Container className="d-flex justify-content-between align-items-center">
                    <h2 className="profile-title">👤 Hồ Sơ Của Tôi</h2>
                    <button className="btn-back-home" onClick={() => navigate('/')}>
                        <i className="bi bi-arrow-left"></i> Về Trang chủ
                    </button>
                </Container>
            </div>

            <Container className="profile-content">
                <Row className="g-4">
                    {/* Cột trái: Thông tin user & Nút Đổi mật khẩu */}
                    <Col lg={3}>
                        <Card className="user-info-card">
                            <Card.Body className="text-center">
                                <div className="user-avatar">
                                    <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                                </div>
                                <h5 className="user-name">{user.username}</h5>
                                <p className="user-email">{user.email || 'Chưa liên kết email'}</p>
                                <span className={`user-role-badge role-${user.role?.toLowerCase()}`}>
                                    {user.role}
                                </span>

                                <div className="user-actions">
                                    <Button className="btn-change-pass" onClick={() => setShowChangePasswordModal(true)}>
                                        <i className="bi bi-key-fill me-2"></i> Đổi mật khẩu
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Cột phải: Lịch sử */}
                    <Col lg={9}>
                        <Card className="history-card">
                            <Card.Body>
                                <Tabs defaultActiveKey="orders" className="custom-tabs mb-4">
                                    {/* TAB ĐƠN HÀNG */}
                                    <Tab eventKey="orders" title={<>🛒 Đơn hàng <Badge bg="secondary" pill>{myOrders.length}</Badge></>}>
                                        {myOrders.length === 0 ? (
                                            <div className="empty-state">
                                                <i className="bi bi-cart-x"></i>
                                                <p>Bạn chưa có đơn hàng nào.</p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <Table hover className="history-table align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã đơn</th>
                                                            <th>Ngày đặt</th>
                                                            <th>Tổng tiền</th>
                                                            <th>Trạng thái</th>
                                                            <th>Chi tiết món</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {myOrders.map(order => (
                                                            <tr key={order.id}>
                                                                <td className="fw-bold text-muted">#{order.id}</td>
                                                                <td className="text-secondary">{new Date(order.createdAt).toLocaleString()}</td>
                                                                <td className="fw-bold text-primary">{order.totalPrice.toLocaleString()}đ</td>
                                                                <td>
                                                                    <div className="status-stack">
                                                                        {/* Thanh toán */}
                                                                        {order.paymentStatus === 'PAID' ?
                                                                            <span className="status-pill status-success"><i className="bi bi-check-circle-fill"></i> Đã thanh toán</span> :
                                                                            (order.paymentStatus === 'FAILED' ?
                                                                                <span className="status-pill status-danger">Thất bại</span> :
                                                                                <span className="status-pill status-warning">Chờ thanh toán</span>)
                                                                        }

                                                                        {/* Bếp */}
                                                                        {order.orderStatus === 'CONFIRMED' && <span className="status-pill status-info">Đã xác nhận</span>}
                                                                        {order.orderStatus === 'COOKING' && <span className="status-pill status-primary"><i className="bi bi-fire"></i> Đang nấu</span>}
                                                                        {order.orderStatus === 'COMPLETED' && <span className="status-pill status-dark"><i className="bi bi-check2-all"></i> Hoàn tất</span>}
                                                                        {order.orderStatus === 'FAILED' && <span className="status-pill status-danger">Đã hủy</span>}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <ul className="item-list">
                                                                        {order.items.map((item, idx) => (
                                                                            <li key={idx}>
                                                                                <span className="item-qty">{item.quantity}x</span> {item.menu.name}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </Tab>

                                    {/* TAB ĐẶT BÀN */}
                                    <Tab eventKey="bookings" title={<>📅 Lịch đặt bàn <Badge bg="secondary" pill>{myBookings.length}</Badge></>}>
                                        {myBookings.length === 0 ? (
                                            <div className="empty-state">
                                                <i className="bi bi-calendar-x"></i>
                                                <p>Bạn chưa đặt bàn lần nào.</p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <Table hover className="history-table align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Thời gian đến</th>
                                                            <th>Số khách</th>
                                                            <th>Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {myBookings.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="fw-medium">{new Date(item.date).toLocaleString()}</td>
                                                                <td>
                                                                    <span className="people-badge"><i className="bi bi-people-fill"></i> {item.people}</span>
                                                                </td>
                                                                <td>
                                                                    {item.status === 'PENDING' && <span className="status-pill status-warning">Chờ duyệt</span>}
                                                                    {item.status === 'CONFIRMED' && <span className="status-pill status-success">Đã xác nhận</span>}
                                                                    {item.status === 'REJECTED' && <span className="status-pill status-danger">Đã hủy</span>}
                                                                    {item.status === 'COMPLETED' && <span className="status-pill status-dark">Đã hoàn tất</span>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal đổi mật khẩu */}
            <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered className="modal-custom">
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu bảo mật</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleChangePassword}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <Form.Control type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handleInputChange} required className="form-control-custom" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handleInputChange} required className="form-control-custom" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handleInputChange} required className="form-control-custom" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowChangePasswordModal(false)}>Hủy bỏ</Button>
                        <Button className="btn-save-pass" type="submit">Cập nhật mật khẩu</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;