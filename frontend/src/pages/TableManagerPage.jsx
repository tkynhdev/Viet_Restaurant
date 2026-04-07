import { useState, useEffect } from 'react';
import { Container, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import io from 'socket.io-client';
import './TableManagerPage.css';

// Kết nối đến server
const socket = io(import.meta.env.VITE_API_URL);

const TableManagerPage = () => {
    const [tables, setTables] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTable, setNewTable] = useState({ name: '', capacity: 4 });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchTables();

        // Lắng nghe tín hiệu cập nhật trạng thái bàn
        const handleTableUpdate = (updatedTable) => {
            console.log("Nhận tín hiệu cập nhật bàn:", updatedTable);
            toast.info(`Bàn ${updatedTable.name} đã đổi trạng thái!`);

            // Cập nhật giao diện mà không cần gọi API
            setTables(prevTables =>
                prevTables.map(table => table.id === updatedTable.id ? updatedTable : table)
            );
        };
        socket.on('table_status_updated', handleTableUpdate);

        // Dọn dẹp
        return () => {
            socket.off('table_status_updated');
        };
    }, []);

    const fetchTables = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tables`);
            setTables(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTable = async () => {
        if (!newTable.name) return toast.warning('Nhập tên bàn!');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/tables`, newTable, config);
            toast.success('Thêm bàn thành công');
            setShowAddModal(false);
            setNewTable({ name: '', capacity: 4 });
            fetchTables();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi thêm bàn');
        }
    };

    const toggleStatus = async (table) => {
        try {
            const newStatus = table.status === 'EMPTY' ? 'OCCUPIED' : 'EMPTY';
            await axios.put(`${import.meta.env.VITE_API_URL}/api/tables/${table.id}`, { status: newStatus }, config);
            // fetchTables(); // Không cần gọi thủ công nữa vì Socket sẽ kích hoạt fetchTables
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    const deleteTable = async (id) => {
        if (!window.confirm('Xóa bàn này?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/tables/${id}`, config);
            toast.success('Đã xóa');
            // fetchTables(); // Socket sẽ lo việc update
        } catch (err) {
            toast.error('Không thể xóa bàn này');
        }
    }

    return (
        <>
            <MyNavbar />
            <Container className="page-container">
                <div className="page-header">
                    <h2 className="page-title">🗺️ Sơ đồ Bàn ăn <span className="live-badge">Live Update</span></h2>
                    <Button className="btn-add-table" onClick={() => setShowAddModal(true)}>
                        + Thêm bàn mới
                    </Button>
                </div>

                <div className="table-map-grid">
                    {tables.map(table => (
                        <div key={table.id} className="table-card">
                            {/* Header hiển thị trạng thái màu sắc */}
                            <div className={`table-card-header ${table.status === 'EMPTY' ? 'status-empty' : 'status-occupied'}`}>
                                <div className="status-icon">
                                    {/* Icon bàn ăn (có thể thay bằng icon svg nếu muốn) */}
                                    <i className="bi bi-display"></i>
                                </div>
                                <span className="status-label">
                                    {table.status === 'EMPTY' ? 'TRỐNG' : 'ĐANG DÙNG'}
                                </span>
                            </div>

                            <div className="table-card-body">
                                <h5 className="table-name">{table.name}</h5>
                                <div className="table-meta">
                                    <span className="capacity-badge">
                                        <i className="bi bi-people-fill"></i> {table.capacity} ghế
                                    </span>
                                </div>
                            </div>

                            <div className="table-card-footer">
                                <Button
                                    size="sm"
                                    className={`btn-toggle-status ${table.status === 'EMPTY' ? 'btn-check-in' : 'btn-check-out'}`}
                                    onClick={() => toggleStatus(table)}
                                >
                                    {table.status === 'EMPTY' ? 'Xếp khách' : 'Thanh toán'}
                                </Button>
                                <button className="btn-delete-text" onClick={() => deleteTable(table.id)}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Thêm Bàn */}
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered className="modal-custom">
                    <Modal.Header closeButton>
                        <Modal.Title>Thêm bàn mới</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên bàn</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ví dụ: Bàn 1, VIP 2..."
                                    onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số ghế tối đa</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newTable.capacity}
                                    onChange={e => setNewTable({ ...newTable, capacity: e.target.value })}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="btn-save-modal" onClick={handleAddTable}>Lưu bàn mới</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default TableManagerPage;