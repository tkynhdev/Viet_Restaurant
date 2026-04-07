import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Form, Modal, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import './HomePage.css';
// 1. Import model-viewer (Cho AR món ăn)
import '@google/model-viewer';
// 2. Import VirtualTour (Cho VR nhà hàng)
import VirtualTour from '../components/VirtualTour';

const HomePage = () => {
    const { addToCart, totalItems } = useCart();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // State cho Modal AR (Món ăn 3D)
    const [showARModal, setShowARModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    // --- State cho Modal VR (Tham quan nhà hàng) ---
    const [showVRModal, setShowVRModal] = useState(false);

    const [booking, setBooking] = useState({
        name: '', phone: '', date: '', people: 2, note: ''
    });

    useEffect(() => {
        fetchPublicMenu();
    }, []);

    const fetchPublicMenu = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/menu`);
            const availableMenus = res.data.filter(item => item.isAvailable);
            setMenus(availableMenus);
        } catch (err) {
            console.error("Lỗi tải menu:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.post(`${import.meta.env.VITE_API_URL}/api/reservations`, {
                ...booking,
                people: parseInt(booking.people)
            }, config);

            toast.success('🎉 Đặt bàn thành công! Vào mục Hồ sơ để kiểm tra.');
            setBooking({ name: '', phone: '', date: '', people: 2, note: '' });
        } catch (err) {
            toast.error('Lỗi đặt bàn: ' + (err.response?.data?.message || 'Thử lại sau'));
        }
    };

    const filteredMenus = menus.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === 'ALL' || item.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const openAR = (modelUrl) => {
        setSelectedModel(modelUrl);
        setShowARModal(true);
    };

    return (
        <div className="homepage-wrapper">
            {/* 1. NAVBAR CLIENT */}
            <Navbar expand="lg" className="client-navbar fixed-top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="brand-logo-client">
                        <div className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" /></svg>
                        </div>
                        <span>VIET RESTAURANT</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="toggler-client">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </Navbar.Toggle>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center nav-client-items">
                            <Nav.Link href="#menu" className="nav-link-client">Thực đơn</Nav.Link>
                            <Nav.Link href="#booking" className="nav-link-client">Đặt bàn</Nav.Link>
                            <Nav.Link href="#footer-section" className="nav-link-client">Liên hệ</Nav.Link>

                            <Nav.Link as={Link} to="/cart" className="cart-btn-client">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                <span>Giỏ hàng</span>
                                {totalItems > 0 && <span className="cart-badge-pulse">{totalItems}</span>}
                            </Nav.Link>

                            <div className="auth-separator-client"></div>

                            {user ? (
                                <div className="user-menu-client">
                                    <Link to="/profile" className="user-name-pill">
                                        <div className="avatar-circle">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.username}</span>
                                    </Link>

                                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                                        <button className="btn-icon-action" onClick={() => navigate('/admin/orders')} title="Quản lý">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                        </button>
                                    )}

                                    <button className="btn-icon-action logout" onClick={handleLogout} title="Đăng xuất">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    </button>
                                </div>
                            ) : (
                                <Button className="btn-client-login" onClick={() => navigate('/login')}>
                                    Đăng nhập
                                </Button>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 2. HERO BANNER */}
            <section className="hero-banner">
                <div className="hero-overlay">
                    <Container className="text-center">
                        <span className="hero-subtitle">Chào mừng đến với Viet Restaurant</span>
                        <h1 className="hero-title">Hương Vị Việt <br /> Tinh Tế & Đẳng Cấp</h1>
                        <p className="hero-desc">Trải nghiệm ẩm thực tuyệt vời ngay tại không gian sang trọng.</p>
                        <div className="hero-actions">
                            <Button href="#booking" className="btn-hero-primary">ĐẶT BÀN NGAY</Button>
                            <Button href="#menu" className="btn-hero-secondary">XEM THỰC ĐƠN</Button>
                        </div>
                    </Container>
                </div>
            </section>

            {/* 3. MENU SECTION */}
            <section className="menu-section" id="menu">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="section-title">Thực Đơn Hôm Nay</h2>
                        <div className="title-underline"></div>
                    </div>

                    <div className="menu-toolbar">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Bạn muốn ăn gì hôm nay?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <button className={`filter-btn ${filterCategory === 'ALL' ? 'active' : ''}`} onClick={() => setFilterCategory('ALL')}>Tất cả</button>
                            <button className={`filter-btn ${filterCategory === 'DoAn' ? 'active' : ''}`} onClick={() => setFilterCategory('DoAn')}>Đồ ăn</button>
                            <button className={`filter-btn ${filterCategory === 'DoUong' ? 'active' : ''}`} onClick={() => setFilterCategory('DoUong')}>Đồ uống</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                    ) : (
                        <div className="menu-grid">
                            {filteredMenus.length > 0 ? filteredMenus.map((item) => (
                                <div key={item.id} className="menu-card">
                                    <div className="card-img-top">
                                        <img src={item.imageUrl || 'https://placehold.co/400x300?text=No+Image'} alt={item.name} />
                                        <span className={`category-tag ${item.category === 'DoAn' ? 'tag-food' : 'tag-drink'}`}>
                                            {item.category === 'DoAn' ? 'Đồ ăn' : 'Đồ uống'}
                                        </span>

                                        {/* Nút Xem 3D AR */}
                                        {item.model3dUrl && (
                                            <button
                                                className="btn-3d-view"
                                                onClick={() => openAR(item.model3dUrl)}
                                                title="Xem mô hình 3D"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">{item.name}</h3>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="price-tag">{item.price.toLocaleString()}đ</span>
                                            <button
                                                className="btn-add-cart"
                                                onClick={() => {
                                                    addToCart(item);
                                                    toast.success(`Đã thêm: ${item.name}`);
                                                }}
                                            >
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center w-100 text-muted">
                                    <h5>Không tìm thấy món ăn nào phù hợp!</h5>
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </section>

            {/* 4. BOOKING SECTION */}
            <section className="booking-section" id="booking">
                <Container>
                    <div className="booking-card-wrapper">
                        <div className="booking-info">
                            <h3>ĐẶT BÀN TRỰC TUYẾN</h3>
                            <p>Vui lòng điền thông tin, chúng tôi sẽ giữ chỗ cho bạn.</p>
                            <ul className="contact-list">
                                <li><i>📍</i> Hutech Khu Công Nghệ Cao</li>
                                <li><i>📞</i> 0967877911</li>
                            </ul>
                        </div>

                        <div className="booking-form-area">
                            <Form onSubmit={handleBookingSubmit}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Họ và Tên</Form.Label>
                                        <Form.Control type="text" className="form-input-custom" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} required />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control type="text" className="form-input-custom" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} required />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Ngày giờ ăn</Form.Label>
                                        <Form.Control type="datetime-local" className="form-input-custom" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} required />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Số lượng khách</Form.Label>
                                        <Form.Control type="number" min="1" className="form-input-custom" value={booking.people} onChange={e => setBooking({ ...booking, people: e.target.value })} required />
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Ghi chú thêm</Form.Label>
                                    <Form.Control as="textarea" rows={3} className="form-input-custom" value={booking.note} onChange={e => setBooking({ ...booking, note: e.target.value })} />
                                </Form.Group>

                                <Button type="submit" className="btn-submit-booking">XÁC NHẬN ĐẶT BÀN</Button>
                            </Form>
                        </div>
                    </div>
                </Container>
            </section>

            {/* --- 5. NÚT KÍCH HOẠT VR360 (MỚI) --- */}
            <section className="vr-trigger-section text-center text-white py-5" style={{
                background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                marginTop: '60px'
            }}>
                <Container>
                    <h2 className="fw-bold mb-3 display-5">Khám Phá Không Gian 360°</h2>
                    <p className="lead mb-4">Trải nghiệm thực tế ảo không gian nhà hàng sang trọng trước khi đặt bàn.</p>
                    <Button
                        variant="outline-light"
                        size="lg"
                        className="rounded-pill px-5 py-3 fw-bold border-2"
                        onClick={() => setShowVRModal(true)}
                    >
                        <i className="bi bi-goggles fs-4 me-2"></i> BẮT ĐẦU THAM QUAN
                    </Button>
                </Container>
            </section>

            {/* --- 6. FOOTER CÓ GOOGLE MAP --- */}
            <footer className="client-footer" id="footer-section">
                <Container>
                    <Row className="gy-4">
                        {/* Cột 1: Thông tin */}
                        <Col lg={5} md={6} className="text-start">
                            <h4 className="fw-bold text-white mb-4">VIET RESTAURANT</h4>
                            <p className="text-muted"><i className="bi bi-geo-alt me-2 text-warning"></i> Hutech Khu Công Nghệ Cao, TP.HCM</p>
                            <p className="text-muted"><i className="bi bi-telephone me-2 text-warning"></i> 0967.877.911</p>
                            <p className="text-muted"><i className="bi bi-envelope me-2 text-warning"></i> thinhdev6604@gmail.com</p>
                            <div className="d-flex gap-3 mt-3">
                                <Button variant="outline-light" className="rounded-circle btn-social"><i className="bi bi-facebook"></i></Button>
                                <Button variant="outline-light" className="rounded-circle btn-social"><i className="bi bi-instagram"></i></Button>
                                <Button variant="outline-light" className="rounded-circle btn-social"><i className="bi bi-youtube"></i></Button>
                            </div>
                        </Col>

                        {/* Cột 2: Google Map */}
                        <Col lg={7} md={6}>
                            <div className="map-container shadow rounded overflow-hidden" style={{ height: '250px' }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4206639968345!2d106.78291407469842!3d10.855574757730994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e7ea103df%3A0xb6cf10bb7d719327!2sHUTECH%20University%20-%20Saigon%20Hi-Tech%20Park%20Campus!5e0!3m2!1sen!2s!4v1715423887500!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </Col>
                    </Row>
                    <hr className="border-secondary my-4" />
                    <p className="small text-muted mb-0">© 2025 Đồ án Tốt nghiệp CNTT - Viet Restaurant.</p>
                </Container>
            </footer>

            {/* --- MODAL HIỂN THỊ VR360 --- */}
            <Modal
                show={showVRModal}
                onHide={() => setShowVRModal(false)}
                size="xl"
                centered
                className="vr-modal"
            >
                <Modal.Header closeButton className="bg-dark text-white border-0">
                    <Modal.Title><i className="bi bi-arrows-move"></i> Tham quan Nhà hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-black">
                    {showVRModal && <VirtualTour />}
                </Modal.Body>
            </Modal>

            {/* MODAL HIỂN THỊ AR/3D */}
            <Modal show={showARModal} onHide={() => setShowARModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Trải nghiệm món ăn 3D</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-light rounded-bottom overflow-hidden" style={{ height: '500px', position: 'relative' }}>
                    <model-viewer
                        src={selectedModel}
                        alt="Mô hình món ăn 3D"
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        style={{ width: '100%', height: '100%' }}
                        background-color="#f5f5f5"
                    >
                        <div className="progress-bar hide" slot="progress-bar">
                            <div className="update-bar"></div>
                        </div>
                        <Button slot="ar-button" variant="dark" className="position-absolute bottom-0 start-50 translate-middle-x mb-4 rounded-pill px-4 shadow">
                            <i className="bi bi-phone-vibrate me-2"></i> Xem bằng AR
                        </Button>
                    </model-viewer>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default HomePage;