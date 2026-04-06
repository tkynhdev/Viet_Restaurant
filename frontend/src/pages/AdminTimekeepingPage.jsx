import { useState, useEffect } from 'react';
import { Container, Table, Badge, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const AdminTimekeepingPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();

        // Admin ngồi chơi cũng biết nhân viên vừa chấm công
        socket.on('new_checkin', (newLog) => {
            toast.info(`📸 ${newLog.user?.username || 'Nhân viên'} vừa chấm công!`);
            fetchLogs(); // Tự động load lại bảng
        });

        return () => {
            socket.off('new_checkin');
        };
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/timekeeping', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi tải dữ liệu chấm công");
        }
    };

    return (
        <>
            <MyNavbar />
            <Container fluid className="px-4 py-4">
                <h2 className="mb-4">📅 Lịch sử Chấm công Nhân viên</h2>

                <Card className="shadow-sm border-0">
                    <Card.Body className="p-0">
                        <Table hover responsive className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nhân viên</th>
                                    <th>Vai trò</th>
                                    <th>Thời gian</th>
                                    <th>Vị trí / GPS</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log.id}>
                                        <td>#{log.id}</td>
                                        <td className="fw-bold text-primary">
                                            {log.user?.username}
                                        </td>
                                        <td>
                                            <Badge bg="secondary">{log.user?.role}</Badge>
                                        </td>
                                        <td>
                                            {new Date(log.checkIn).toLocaleDateString()} <br />
                                            <small className="text-muted">{new Date(log.checkIn).toLocaleTimeString()}</small>
                                        </td>
                                        <td className="small text-muted">{log.location || 'Không xác định'}</td>
                                        <td>
                                            {log.status === 'LATE'
                                                ? <Badge bg="danger">Đi muộn</Badge>
                                                : <Badge bg="success">Đúng giờ</Badge>
                                            }
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">Chưa có dữ liệu chấm công.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default AdminTimekeepingPage;