import { useState } from 'react';
import { Container, Row, Col, Table, Button, Form, Card, Image } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CartPage.css';

const CartPage = () => {
    const { cart, decreaseQuantity, addToCart, removeFromCart, toggleCheck, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [isLoading, setIsLoading] = useState(false);
    const [info, setInfo] = useState({
        name: user.username || '',
        phone: '',
        date: '',
        people: 2,
        note: '',
        paymentMethod: 'BANK'
    });

    // CẤU HÌNH TÀI KHOẢN NHẬN TIỀN 
    const BANK_INFO = {
        BANK_ID: 'BIDV',
        ACCOUNT_NO: '1110558996',
        ACCOUNT_NAME: 'NGUYEN DUC THINH',
        TEMPLATE: 'compact2'
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        const selectedItems = cart.filter(item => item.checked);
        if (selectedItems.length === 0) return toast.error('Vui lòng tick chọn món!');

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // 1. Tạo đơn hàng
            const orderRes = await axios.post('http://localhost:5000/api/orders', {
                cartItems: selectedItems,
                totalPrice: totalPrice,
                paymentMethod: info.paymentMethod,
                bookingInfo: {
                    name: info.name,
                    phone: info.phone,
                    date: info.date,
                    people: parseInt(info.people),
                    note: info.note
                }
            }, config);

            const orderId = orderRes.data.id;

            // XỬ LÝ THEO TỪNG PHƯƠNG THỨC
            if (info.paymentMethod === 'VNPAY') {
                const vnpRes = await axios.post('http://localhost:5000/api/payment/create_payment_url', {
                    amount: totalPrice,
                    orderId: orderId,
                    bankCode: 'NCB',
                    language: 'vn'
                });
                window.open(vnpRes.data.paymentUrl, '_blank');
                toast.info('Đang chuyển sang VNPAY...');
                setTimeout(() => navigate('/profile'), 2000);

            } else if (info.paymentMethod === 'BANK') {
                toast.info('Đơn hàng đã được ghi nhận! Vui lòng chuyển khoản để Admin duyệt đơn.');
                clearCart();
                navigate('/profile');

            } else if (info.paymentMethod === 'MOMO') {
                toast.info('Đơn hàng đã được ghi nhận! Vui lòng chuyển MoMo để Admin duyệt đơn.');
                clearCart();
                navigate('/profile');

            } else {
                toast.success('Đặt món thành công! Vui lòng thanh toán tại quầy.');
                clearCart();
                navigate('/profile');
            }

        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    if (cart.length === 0) return (
        <Container className="empty-cart-container">
            <div className="empty-cart-content">
                <i className="bi bi-cart-x empty-icon"></i>
                <h3>Giỏ hàng của bạn đang trống</h3>
                <p>Hãy chọn những món ăn ngon tuyệt từ thực đơn của chúng tôi nhé!</p>
                <Link to="/" className="btn-back-home">Quay lại chọn món</Link>
            </div>
        </Container>
    );

    return (
        <Container className="cart-page-container">
            <h2 className="page-title">🛒 Giỏ Hàng Của Bạn</h2>
            <Row className="g-4">
                {/* CỘT TRÁI: DANH SÁCH MÓN */}
                <Col lg={7}>
                    <div className="cart-list-wrapper">
                        <Table responsive className="cart-table align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Món ăn</th>
                                    <th>Đơn giá</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-end">Thành tiền</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id} className={!item.checked ? 'item-unchecked' : ''}>
                                        <td className="text-center">
                                            <Form.Check
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => toggleCheck(item.id)}
                                                className="custom-checkbox"
                                            />
                                        </td>
                                        <td>
                                            <div className="cart-item-info">
                                                <div className="item-img-wrapper">
                                                    <Image src={item.imageUrl} className="item-img" />
                                                </div>
                                                <span className="item-name">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="item-price">{item.price.toLocaleString()}đ</td>
                                        <td className="text-center">
                                            <div className="quantity-control">
                                                <button className="btn-qty" onClick={() => decreaseQuantity(item.id)}>-</button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button className="btn-qty" onClick={() => addToCart(item)}>+</button>
                                            </div>
                                        </td>
                                        <td className="item-total text-end">{(item.price * item.quantity).toLocaleString()}đ</td>
                                        <td className="text-end">
                                            <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="cart-summary-bar">
                        <Link to="/" className="continue-link">
                            <i className="bi bi-arrow-left"></i> Tiếp tục chọn món
                        </Link>
                        <div className="total-display">
                            <span>Tổng cộng:</span>
                            <span className="total-amount">{totalPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                </Col>

                {/* CỘT PHẢI: FORM THANH TOÁN */}
                <Col lg={5}>
                    <Card className="checkout-card">
                        <Card.Header className="checkout-header">
                            THÔNG TIN THANH TOÁN
                        </Card.Header>
                        <Card.Body className="checkout-body">
                            <Form onSubmit={handleCheckout}>
                                <div className="form-section">
                                    <h6 className="section-label">Thông tin khách hàng</h6>
                                    <Row className="g-2 mb-2">
                                        <Col>
                                            <Form.Control className="form-input" type="text" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} required placeholder="Họ tên" />
                                        </Col>
                                        <Col>
                                            <Form.Control className="form-input" type="text" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} required placeholder="Số điện thoại" />
                                        </Col>
                                    </Row>
                                </div>

                                <div className="form-section">
                                    <h6 className="section-label">Thời gian & Số lượng</h6>
                                    <Row className="g-2 mb-2">
                                        <Col>
                                            <Form.Control className="form-input" type="datetime-local" value={info.date} onChange={e => setInfo({ ...info, date: e.target.value })} required />
                                        </Col>
                                        <Col xs={4}>
                                            <Form.Control className="form-input" type="number" min="1" value={info.people} onChange={e => setInfo({ ...info, people: e.target.value })} required placeholder="Khách" />
                                        </Col>
                                    </Row>
                                </div>

                                <div className="form-section">
                                    <h6 className="section-label">Phương thức thanh toán</h6>

                                    {/* 1. VIETQR */}
                                    <div
                                        className={`payment-option ${info.paymentMethod === 'BANK' ? 'selected' : ''}`}
                                        onClick={() => setInfo({ ...info, paymentMethod: 'BANK' })}
                                    >
                                        <div className="option-header">
                                            <Form.Check type="radio" checked={info.paymentMethod === 'BANK'} readOnly />
                                            <span className="option-name">Chuyển khoản (VietQR)</span>
                                            <img src="https://img.vietqr.io/image/MB-00000-compact2.jpg" alt="VietQR" className="option-logo" />
                                        </div>
                                        {info.paymentMethod === 'BANK' && (
                                            <div className="option-detail vietqr-detail">
                                                <p className="qr-guide">Quét mã để thanh toán:</p>
                                                <div className="qr-wrapper">
                                                    <Image
                                                        src={`https://img.vietqr.io/image/${BANK_INFO.BANK_ID}-${BANK_INFO.ACCOUNT_NO}-${BANK_INFO.TEMPLATE}.png?amount=${totalPrice}&addInfo=ORDER ${user.username || 'KHACH'}`}
                                                        fluid
                                                    />
                                                </div>
                                                <div className="account-owner">Chủ TK: {BANK_INFO.ACCOUNT_NAME}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. VNPAY */}
                                    <div
                                        className={`payment-option ${info.paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                                        onClick={() => setInfo({ ...info, paymentMethod: 'VNPAY' })}
                                    >
                                        <div className="option-header">
                                            <Form.Check type="radio" checked={info.paymentMethod === 'VNPAY'} readOnly />
                                            <span className="option-name">Cổng VNPAY</span>
                                            <img src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPAY" className="option-logo" />
                                        </div>
                                    </div>

                                    {/* 3. MOMO */}
                                    <div
                                        className={`payment-option ${info.paymentMethod === 'MOMO' ? 'selected' : ''}`}
                                        onClick={() => setInfo({ ...info, paymentMethod: 'MOMO' })}
                                    >
                                        <div className="option-header">
                                            <Form.Check type="radio" checked={info.paymentMethod === 'MOMO'} readOnly />
                                            <span className="option-name">MoMo Cá nhân</span>
                                            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="option-logo rounded" />
                                        </div>
                                        {info.paymentMethod === 'MOMO' && (
                                            <div className="option-detail momo-detail">
                                                <p>Chuyển tiền đến SĐT: <strong>0967877911</strong></p>
                                                <p>Nội dung: <strong>{user.username} thanh toan</strong></p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. CASH */}
                                    <div
                                        className={`payment-option ${info.paymentMethod === 'CASH' ? 'selected' : ''}`}
                                        onClick={() => setInfo({ ...info, paymentMethod: 'CASH' })}
                                    >
                                        <div className="option-header">
                                            <Form.Check type="radio" checked={info.paymentMethod === 'CASH'} readOnly />
                                            <span className="option-name">Tiền mặt tại quầy</span>
                                            <i className="bi bi-cash-stack ms-auto fs-5 text-success"></i>
                                        </div>
                                    </div>
                                </div>

                                <Button className="btn-checkout" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : (info.paymentMethod === 'VNPAY' ? 'THANH TOÁN ONLINE' : 'XÁC NHẬN ĐẶT MÓN')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CartPage;