import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import './LoginPage.css'; // Giữ nguyên import CSS của bạn

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // --- HÀM ĐIỀU HƯỚNG MỚI (Logic thông minh) ---
    const redirectUser = (role) => {
        switch (role) {
            case 'ADMIN':
                navigate('/dashboard'); // Admin vào Báo cáo
                break;
            case 'CASHIER':
                navigate('/admin/orders'); // Thu ngân vào Vận hành
                break;
            case 'CHEF':
                navigate('/kitchen'); // Bếp vào Màn hình bếp
                break;
            case 'STAFF': // Dự phòng cho các tài khoản cũ
                navigate('/admin/orders');
                break;
            default:
                navigate('/'); // Khách hàng về trang chủ
                break;
        }
    };

    // HÀM XỬ LÝ LOGIN BẰNG TÀI KHOẢN THƯỜNG
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                // Xử lý Đăng ký
                await axios.post('http://localhost:5000/api/auth/register', { username, password });
                toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsRegister(false);
            } else {
                // Xử lý Đăng nhập
                const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                toast.success(`Chào mừng ${res.data.user.username}!`);

                // --- SỬA: Gọi hàm điều hướng mới ---
                setTimeout(() => {
                    redirectUser(res.data.user.role);
                }, 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // HÀM XỬ LÝ LOGIN BẰNG GOOGLE
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const res = await axios.post('http://localhost:5000/api/auth/google', {
                email: user.email,
                username: user.displayName,
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success(`Chào mừng ${res.data.user.username}!`);

            // --- SỬA: Gọi hàm điều hướng mới ---
            setTimeout(() => {
                redirectUser(res.data.user.role);
            }, 1000);

        } catch (err) {
            toast.error('Lỗi đăng nhập Google');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* Cột hình ảnh (Branding) */}
                <div className="login-visual-side">
                    <div className="visual-overlay">
                        <div className="brand-content">
                            <h1 className="brand-title">VIET RESTAURANT</h1>
                            <p className="brand-slogan">Tinh hoa ẩm thực Việt</p>
                            <div className="brand-divider"></div>
                            <p className="brand-desc">Nguyễn Đức Thịnh - Đồ Án Chuyên Ngành 2025.</p>
                        </div>
                    </div>
                </div>

                {/* Cột Form */}
                <div className="login-form-side">
                    <div className="form-content">
                        <div className="form-header">
                            <h2 className="form-title">
                                {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập hệ thống'}
                            </h2>
                            <p className="form-subtitle">
                                {isRegister ? 'Nhập thông tin để bắt đầu quản lý' : 'Chào mừng bạn quay trở lại!'}
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="custom-label">Tên tài khoản</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập username..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="custom-input"
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="custom-label">Mật khẩu</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="custom-input"
                                    required
                                />
                            </Form.Group>

                            <Button type="submit" className="btn-auth-submit">
                                {isRegister ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
                            </Button>
                        </Form>

                        <div className="auth-separator">
                            <span>Hoặc tiếp tục với</span>
                        </div>

                        <Button className="btn-google-auth" onClick={handleGoogleLogin}>
                            <i className="bi bi-google"></i>
                            <span>Google Account</span>
                        </Button>

                        <div className="auth-footer">
                            <span className="text-muted">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
                            <span
                                className="auth-link"
                                onClick={() => setIsRegister(!isRegister)}
                            >
                                {isRegister ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;