import { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';

const StaffPage = () => {
    const [info, setInfo] = useState({ username: '', password: '', role: 'CASHIER' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/create-staff', info, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Đã tạo tài khoản ${info.role} thành công!`);
            setInfo({ username: '', password: '', role: 'CASHIER' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi tạo tài khoản');
        }
    };

    return (
        <>
            <MyNavbar />
            <Container className="d-flex justify-content-center mt-5">
                <Card style={{ width: '500px' }} className="shadow">
                    <Card.Header className="bg-dark text-white fw-bold">Thêm Nhân Viên Mới</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên đăng nhập</Form.Label>
                                <Form.Control type="text" value={info.username} onChange={e => setInfo({ ...info, username: e.target.value })} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mật khẩu</Form.Label>
                                <Form.Control type="password" value={info.password} onChange={e => setInfo({ ...info, password: e.target.value })} required />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label>Vai trò (Chức vụ)</Form.Label>
                                <Form.Select value={info.role} onChange={e => setInfo({ ...info, role: e.target.value })}>
                                    <option value="CASHIER">Thu ngân (Cashier)</option>
                                    <option value="CHEF">Đầu bếp (Chef)</option>
                                    <option value="ADMIN">Quản lý (Admin)</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">Tạo Tài Khoản</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default StaffPage;