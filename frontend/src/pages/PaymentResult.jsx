import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './PaymentResult.css'; // Import CSS

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('loading'); // loading, success, failed

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy tất cả tham số trên URL
                const params = Object.fromEntries([...searchParams]);

                // Nếu không có tham số nào (user tự gõ link) thì về trang chủ
                if (Object.keys(params).length === 0) {
                    navigate('/');
                    return;
                }

                // Gọi Backend kiểm tra chữ ký bảo mật
                const res = await axios.get('http://localhost:5000/api/payment/vnpay_return', { params });

                if (res.data.status === 'success') {
                    setStatus('success');
                    clearCart(); // Xóa giỏ hàng vì đã mua xong
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('failed');
            }
        };

        // Chạy hàm check ngay khi vào trang
        verifyPayment();
    }, []);

    return (
        <div className="payment-result-wrapper">
            <Container className="d-flex justify-content-center align-items-center h-100">
                <Card className="payment-card">
                    <Card.Body className="p-0">

                        {/* TRẠNG THÁI: LOADING */}
                        {status === 'loading' && (
                            <div className="status-content loading-state">
                                <Spinner animation="border" className="custom-spinner mb-4" />
                                <h4 className="status-title">Đang xác thực giao dịch...</h4>
                                <p className="status-desc">Hệ thống đang xử lý kết quả thanh toán từ ngân hàng. <br />Vui lòng không tắt trình duyệt.</p>
                            </div>
                        )}

                        {/* TRẠNG THÁI: THÀNH CÔNG */}
                        {status === 'success' && (
                            <div className="status-content success-state">
                                <div className="icon-circle success-icon mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <h3 className="status-title text-success">Thanh toán Thành công!</h3>
                                <p className="status-desc">
                                    Cảm ơn bạn đã đặt món. <br />
                                    Đơn hàng đã được chuyển xuống bếp để chế biến ngay.
                                </p>

                                <div className="action-buttons">
                                    <Button className="btn-primary-action" onClick={() => navigate('/profile')}>
                                        Xem đơn hàng của tôi
                                    </Button>
                                    <Button className="btn-secondary-action" onClick={() => navigate('/')}>
                                        Quay về trang chủ
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TRẠNG THÁI: THẤT BẠI */}
                        {status === 'failed' && (
                            <div className="status-content failed-state">
                                <div className="icon-circle failed-icon mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </div>
                                <h3 className="status-title text-danger">Giao dịch Thất bại</h3>
                                <p className="status-desc">
                                    Quá trình thanh toán bị lỗi hoặc đã bị hủy. <br />
                                    Vui lòng kiểm tra lại hoặc chọn phương thức khác.
                                </p>

                                <div className="action-buttons">
                                    <Button className="btn-primary-action btn-retry" onClick={() => navigate('/cart')}>
                                        Quay lại giỏ hàng
                                    </Button>
                                    <Button className="btn-secondary-action" onClick={() => navigate('/')}>
                                        Về trang chủ
                                    </Button>
                                </div>
                            </div>
                        )}

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default PaymentResult;