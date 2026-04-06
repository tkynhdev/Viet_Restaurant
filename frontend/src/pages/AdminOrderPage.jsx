import { useState, useEffect } from 'react'; // Xóa useRef vì không dùng nữa
import { Container, Table, Button, Modal, Row, Col, Dropdown, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import io from 'socket.io-client';
import './AdminOrderPage.css';
// Xóa import useReactToPrint và Invoice vì không dùng cách cũ nữa

const socket = io('http://localhost:5000');

const AdminOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // --- CÁC HÀM FETCH ---
    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders', config);
            const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTables = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tables');
            setTables(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Lỗi tải danh sách bàn');
        }
    };

    // --- LOGIC XỬ LÝ ---
    const updateStatus = async (id, updates) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}`, updates, config);
            toast.success('Cập nhật thành công');
            setShowDetailModal(false);
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    const handleAssignTable = async (tableId) => {
        if (!selectedOrder) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${selectedOrder.id}/assign-table`, { tableId }, config);
            toast.success(`Đã xếp đơn #${selectedOrder.id} vào bàn!`);
            setShowAssignModal(false);
        } catch (err) {
            toast.error("Lỗi khi xếp bàn");
        }
    };

    const openAssignModal = (order) => {
        setSelectedOrder(order);
        fetchTables();
        setShowAssignModal(true);
    };

    // --- HÀM IN HÓA ĐƠN MỚI (Mở Tab Mới) ---
    const handleOpenInvoice = () => {
        if (selectedOrder) {
            window.open(`/print-invoice/${selectedOrder.id}`, '_blank');
        }
    };

    // --- USE EFFECT ---
    useEffect(() => {
        fetchOrders();

        const handleOrderUpdate = (updatedOrder) => {
            setOrders(prevOrders => {
                const existingOrder = prevOrders.find(o => o.id === updatedOrder.id);
                if (existingOrder) {
                    return prevOrders.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
                } else {
                    return [updatedOrder, ...prevOrders];
                }
            });
            if (selectedOrder && selectedOrder.id === updatedOrder.id) {
                setSelectedOrder(prev => ({ ...prev, ...updatedOrder }));
            }
        };

        socket.on('new_order', (newOrderData) => {
            toast.info(`🔔 Có đơn hàng mới!`);
            fetchOrders();
        });

        socket.on('order_updated', (updatedOrderData) => {
            handleOrderUpdate(updatedOrderData);
        });

        return () => {
            socket.off('new_order');
            socket.off('order_updated');
        };
    }, [selectedOrder]);

    return (
        <>
            <MyNavbar />
            <Container fluid className="admin-page-container">
                <div className="page-header">
                    <h2 className="page-title">📡 Trung tâm Vận hành</h2>
                    <div className="header-meta">Real-time Orders</div>
                </div>

                <div className="table-responsive-custom">
                    <Table hover className="admin-table align-middle">
                        <thead>
                            <tr>
                                <th>ID Đơn</th>
                                <th>Thông tin Khách</th>
                                <th>Chi tiết Đặt bàn</th>
                                <th>Vị trí</th>
                                <th className="text-center">Thanh toán</th>
                                <th className="text-center">Trạng thái Bếp</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const isPending = order.orderStatus === 'PENDING';
                                return (
                                    <tr key={order.id} className={isPending ? 'row-pending' : ''}>
                                        <td><span className="order-id-badge">#{order.id}</span></td>
                                        <td>
                                            <div className="customer-name">
                                                {order.user?.username || order.reservation?.name || 'Khách vãng lai'}
                                            </div>
                                            <div className="customer-phone">{order.reservation?.phone}</div>
                                            <div className="text-muted small mt-1">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td>
                                            {order.reservation ? (
                                                <div className="reservation-info">
                                                    <span>{new Date(order.reservation.date).toLocaleString()}</span>
                                                    <span className="reservation-note">
                                                        {order.reservation.people} người • {order.reservation.note || 'Không ghi chú'}
                                                    </span>
                                                </div>
                                            ) : <span className="text-muted">--</span>}
                                        </td>
                                        <td>
                                            {order.table ?
                                                <span className="table-badge">{order.table.name}</span>
                                                : <span className="text-muted">--</span>
                                            }
                                        </td>

                                        {/* Cột Thanh toán */}
                                        <td className="text-center">
                                            {order.paymentStatus === 'PAID' ?
                                                <span className="status-badge badge-paid">Đã thanh toán</span> :
                                                <span className="status-badge badge-unpaid">Chưa thanh toán</span>
                                            }
                                        </td>

                                        {/* Cột Trạng thái Bếp */}
                                        <td className="text-center">
                                            {order.orderStatus === 'COOKING' && <span className="status-badge badge-cooking">Đang nấu</span>}
                                            {order.orderStatus === 'COMPLETED' && <span className="status-badge badge-completed">Hoàn tất</span>}
                                            {order.orderStatus === 'FAILED' && <span className="status-badge badge-failed">Đã hủy</span>}
                                            {order.orderStatus === 'CONFIRMED' && <span className="status-badge badge-paid">Đã xác nhận</span>}
                                            {order.orderStatus === 'PENDING' && <span className="status-badge badge-pending">Chờ xử lý</span>}
                                        </td>

                                        {/* Cột Hành động nhanh */}
                                        <td className="text-center">
                                            <div className="action-group">
                                                <Button size="sm" className="btn-detail" onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
                                                    Chi tiết
                                                </Button>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle className="btn-dropdown-toggle" size="sm" />
                                                    <Dropdown.Menu className="dropdown-menu-custom">
                                                        {order.paymentStatus !== 'PAID' && (
                                                            <Dropdown.Item onClick={() => updateStatus(order.id, { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' })}>
                                                                💰 Xác nhận Thanh toán
                                                            </Dropdown.Item>
                                                        )}
                                                        {order.reservation && !order.table && (
                                                            <Dropdown.Item onClick={() => openAssignModal(order)}>
                                                                🍽️ Xếp bàn
                                                            </Dropdown.Item>
                                                        )}
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item onClick={() => updateStatus(order.id, { orderStatus: 'COOKING' })}>👨‍🍳 Báo bếp nấu</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => updateStatus(order.id, { orderStatus: 'COMPLETED' })}>✅ Hoàn tất</Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item className="text-danger" onClick={() => updateStatus(order.id, { orderStatus: 'FAILED', paymentStatus: 'FAILED' })}>❌ Hủy đơn</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>

                {/* MODAL 1: CHI TIẾT ĐƠN HÀNG */}
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered className="modal-custom">
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết Đơn hàng #{selectedOrder?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedOrder && (
                            <Row>
                                <Col md={7}>
                                    <h5 className="modal-section-title">Danh sách món ăn</h5>
                                    <Table striped className="detail-table">
                                        <tbody>
                                            {selectedOrder.items?.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="fw-medium">{item.menu ? item.menu.name : 'Món đã xóa'}</td>
                                                    <td className="text-center">x{item.quantity}</td>
                                                    <td className="text-end fw-bold">{(item.price * item.quantity).toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="total-row">
                                                <td colSpan={2}>Tổng cộng</td>
                                                <td className="text-end total-price">{selectedOrder.totalPrice.toLocaleString()}đ</td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </Col>
                                <Col md={5} className="bg-light p-3 rounded">
                                    <div className="info-card">
                                        <h6 className="info-card-title">Thông tin Khách hàng</h6>
                                        <div className="info-item">
                                            <span className="label">Tên:</span>
                                            <span className="value">{selectedOrder.user?.username || selectedOrder.reservation?.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">SĐT:</span>
                                            <span className="value">{selectedOrder.reservation?.phone}</span>
                                        </div>

                                        {selectedOrder.reservation && <>
                                            <hr className="divider" />
                                            <h6 className="info-card-title">Yêu cầu Đặt bàn</h6>
                                            <div className="info-item">
                                                <span className="label">Giờ:</span>
                                                <span className="value">{new Date(selectedOrder.reservation.date).toLocaleString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Khách:</span>
                                                <span className="value">{selectedOrder.reservation.people} người</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Ghi chú:</span>
                                                <span className="value note">{selectedOrder.reservation.note || 'Không có'}</span>
                                            </div>
                                        </>}
                                    </div>

                                    {/* --- NÚT IN HÓA ĐƠN MỚI --- */}
                                    <div className="action-buttons-stack mt-3">
                                        <Button
                                            variant="dark"
                                            className="w-100 mb-2"
                                            onClick={handleOpenInvoice} // Gọi hàm mở tab mới
                                        >
                                            🖨️ Xem & In Hóa Đơn
                                        </Button>

                                        <Button className="btn-stack btn-payment" onClick={() => updateStatus(selectedOrder.id, { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' })}>
                                            💰 Đã nhận tiền
                                        </Button>
                                        <Button className="btn-stack btn-cooking" onClick={() => updateStatus(selectedOrder.id, { orderStatus: 'COOKING' })}>
                                            👨‍🍳 Báo bếp nấu
                                        </Button>
                                        <Button className="btn-stack btn-complete" onClick={() => updateStatus(selectedOrder.id, { orderStatus: 'COMPLETED' })}>
                                            ✅ Hoàn tất
                                        </Button>
                                        <Button className="btn-stack btn-cancel" onClick={() => updateStatus(selectedOrder.id, { orderStatus: 'FAILED', paymentStatus: 'FAILED' })}>
                                            ❌ Hủy đơn
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                </Modal>

                {/* MODAL 2: XẾP BÀN (Giữ nguyên) */}
                <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg" centered className="modal-custom">
                    <Modal.Header closeButton>
                        <Modal.Title>Xếp bàn đơn #{selectedOrder?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="table-selection-grid">
                            {tables.length > 0 ? tables.map(table => (
                                <div
                                    key={table.id}
                                    className={`table-select-card ${table.status === 'EMPTY' ? 'card-free' : 'card-busy'}`}
                                    onClick={() => {
                                        if (table.status === 'EMPTY') handleAssignTable(table.id);
                                        else toast.warning('Bàn này đang có khách!');
                                    }}
                                >
                                    <div className="select-card-body">
                                        <div className="select-card-name">{table.name}</div>
                                        <div className="select-card-info">{table.capacity} ghế</div>
                                        <div className="select-card-status">{table.status === 'EMPTY' ? 'Sẵn sàng' : 'Đang dùng'}</div>
                                    </div>
                                </div>
                            )) : <p>Chưa có bàn nào trong hệ thống.</p>}
                        </div>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    );
};

export default AdminOrderPage;