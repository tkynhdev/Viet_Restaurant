import { useState, useEffect } from 'react';
// 1. Import thêm Modal và Form
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ReservationPage = () => {
    const [bookings, setBookings] = useState([]);
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // --- 2. THÊM STATE CHO TÍNH NĂNG XẾP BÀN ---
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [tables, setTables] = useState([]); // Danh sách bàn trống
    const [selectedReservation, setSelectedReservation] = useState(null); // Đơn đang được xếp

    useEffect(() => {
        fetchBookings();
        socket.on('new_reservation', (newBookingData) => {
            toast.info(`🔔 Có lịch đặt bàn mới từ ${newBookingData.name}!`);
            fetchBookings();
        });
        return () => {
            socket.off('new_reservation');
        };
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reservations', config);
            setBookings(res.data);
        } catch (err) {
            toast.error('Lỗi tải danh sách đặt bàn');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/reservations/${id}`, { status }, config);
            toast.success('Đã cập nhật trạng thái');
            fetchBookings();
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    // --- 3. THÊM CÁC HÀM XỬ LÝ XẾP BÀN ---
    // Hàm mở Modal và tải danh sách bàn trống
    const handleShowAssignModal = async (reservation) => {
        setSelectedReservation(reservation);
        try {
            const res = await axios.get('http://localhost:5000/api/tables');
            // Chỉ lấy các bàn đang trống
            setTables(res.data.filter(t => t.status === 'EMPTY'));
            setShowAssignModal(true);
        } catch (err) {
            toast.error("Lỗi tải danh sách bàn");
        }
    };

    // Hàm gọi API để xếp bàn (Gắn bàn vào đơn hàng)
    const handleAssignTable = async (tableId) => {
        // Kiểm tra để đảm bảo có đơn hàng để xếp
        if (!selectedReservation || !selectedReservation.orders || selectedReservation.orders.length === 0) {
            toast.warning("Đơn này không có món ăn để xếp bàn.");
            return;
        }

        try {
            // Lấy ID của đơn hàng đầu tiên (vì 1 đặt bàn có thể có nhiều đơn)
            const orderId = selectedReservation.orders[0].id;

            // Gọi API Backend vừa viết
            await axios.put(`http://localhost:5000/api/orders/${orderId}/assign-table`, { tableId }, config);

            toast.success(`Đã xếp khách "${selectedReservation.name}" vào bàn thành công!`);
            setShowAssignModal(false); // Đóng Modal
            // Không cần fetch lại bookings, vì chỉ trạng thái bàn đổi
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi xếp bàn");
        }
    };

    return (
        <>
            <MyNavbar />
            <Container fluid className="px-4">
                <h2 className="mb-4 mt-4">📅 Quản lý Đặt bàn (Real-time)</h2>

                <Table striped bordered hover responsive className="align-middle shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>ID Đặt bàn</th>
                            <th>Mã Đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>SĐT</th>
                            <th>Ngày giờ đến</th>
                            <th>Số khách</th>
                            <th style={{ width: '25%' }}>Món đặt trước</th>
                            <th>Ghi chú</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? (
                            bookings.map((item) => (
                                <tr key={item.id}>
                                    <td className="fw-bold">#{item.id}</td>
                                    <td>
                                        {item.orders?.length > 0
                                            ? <Badge bg="secondary">#{item.orders.map(o => o.id).join(', ')}</Badge>
                                            : <span className="text-muted small">N/A</span>
                                        }
                                    </td>
                                    <td className="fw-bold">{item.name}</td>
                                    <td>{item.phone}</td>
                                    <td>{new Date(item.date).toLocaleString()}</td>
                                    <td className="text-center">{item.people}</td>
                                    <td>
                                        {item.orders?.length > 0 ? (
                                            <ul className="list-unstyled mb-0 small">
                                                {item.orders.map((order, oIdx) => (
                                                    <div key={oIdx}>
                                                        {order.items.map((detail, idx) => (
                                                            <li key={idx}>• {detail.menu ? detail.menu.name : 'Món đã xóa'} <b>(x{detail.quantity})</b></li>
                                                        ))}
                                                        <li className="mt-1 fw-bold text-danger border-top pt-1">
                                                            Tổng: {order.totalPrice.toLocaleString()}đ
                                                        </li>
                                                    </div>
                                                ))}
                                            </ul>
                                        ) : (<span className="text-muted small">Không đặt món</span>)}
                                    </td>
                                    <td className="text-muted small">{item.note}</td>
                                    <td>
                                        {item.status === 'PENDING' && <Badge bg="warning" text="dark">Chờ duyệt</Badge>}
                                        {item.status === 'CONFIRMED' && <Badge bg="success">Đã xác nhận</Badge>}
                                        {item.status === 'REJECTED' && <Badge bg="danger">Đã hủy</Badge>}
                                        {item.status === 'COMPLETED' && <Badge bg="primary">Hoàn tất</Badge>}
                                    </td>
                                    <td>
                                        {item.status === 'PENDING' && (
                                            <div className="d-flex gap-1">
                                                <Button size="sm" variant="success" onClick={() => updateStatus(item.id, 'CONFIRMED')} title="Xác nhận">✔</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => updateStatus(item.id, 'REJECTED')} title="Từ chối">✘</Button>
                                            </div>
                                        )}
                                        {item.status === 'CONFIRMED' && (
                                            <div className="d-flex flex-column gap-1">
                                                {/* --- 4. THÊM NÚT "XẾP BÀN" VÀO ĐÂY --- */}
                                                <Button size="sm" variant="warning" onClick={() => handleShowAssignModal(item)}>
                                                    🍽️ Xếp bàn
                                                </Button>
                                                <Button size="sm" variant="outline-primary" onClick={() => updateStatus(item.id, 'COMPLETED')}>
                                                    Hoàn tất
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="10" className="text-center py-4">Chưa có lịch đặt bàn nào.</td></tr>
                        )}
                    </tbody>
                </Table>
            </Container>

            {/* --- 5. THÊM MODAL CHỌN BÀN VÀO CUỐI --- */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chọn bàn cho: {selectedReservation?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Số khách: <strong>{selectedReservation?.people}</strong> | Ghi chú: <span className="text-muted">{selectedReservation?.note || 'Không có'}</span></p>
                    <hr />
                    <h5>Bàn trống hiện có:</h5>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {tables.length > 0 ? tables.map(table => (
                            <Button
                                key={table.id}
                                variant={'outline-success'}
                                onClick={() => handleAssignTable(table.id)}
                                style={{ width: '100px', height: '80px' }}
                                title={`Sức chứa: ${table.capacity} người`}
                            >
                                <div className="fw-bold fs-5">{table.name}</div>
                                <small>{table.capacity} ghế</small>
                            </Button>
                        )) : (
                            <p className="text-muted">Không còn bàn nào trống.</p>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ReservationPage;