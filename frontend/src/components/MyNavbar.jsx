import { Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './MyNavbar.css';

const MyNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user từ localStorage (đảm bảo không lỗi nếu null)
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Hàm kiểm tra active link
    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Nếu là Bếp, không hiện Navbar này (Bếp có giao diện riêng trong KitchenPage)
    // Hoặc nếu bạn muốn Admin vẫn thấy Navbar khi vào trang Bếp thì bỏ dòng này
    if (user.role === 'CHEF') return null;

    return (
        <Navbar expand="lg" className="navbar-admin shadow-sm">
            <Container fluid className="px-4">
                {/* BRAND LOGO */}
                <Navbar.Brand as={Link} to={user.role === 'CHEF' ? "/kitchen" : (user.role === 'ADMIN' ? "/dashboard" : "/admin/orders")} className="nav-brand-wrapper">
                    <div className="brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" /></svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">VIET RESTAURANT</span>
                        <span className="brand-role">{user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : (user.role === 'CASHIER' ? 'THU NGÂN' : 'NHÂN VIÊN')}</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="nav-toggler-custom">
                    <span className="toggler-icon"></span>
                </Navbar.Toggle>

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* MENU LINKS - PHÂN QUYỀN */}
                    <Nav className="mx-auto nav-links-group">

                        {/* --- NHÓM 1: CHỈ ADMIN (Thống kê, Nhân sự, Menu) --- */}
                        {user.role === 'ADMIN' && (
                            <>
                                <Link to="/dashboard" className={`nav-item-custom ${isActive('/dashboard')}`}>
                                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                    <span>Báo cáo</span>
                                </Link>

                                <Link to="/admin/staff" className={`nav-item-custom ${isActive('/admin/staff')}`}>
                                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    <span>Nhân sự</span>
                                </Link>

                                <Link to="/menu" className={`nav-item-custom ${isActive('/menu')}`}>
                                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                    <span>Thực đơn</span>
                                </Link>
                            </>
                        )}

                        {/* --- NHÓM 2: ADMIN HOẶC THU NGÂN (Vận hành, Bàn) --- */}
                        {(user.role === 'ADMIN' || user.role === 'CASHIER') && (
                            <>
                                <Link to="/admin/orders" className={`nav-item-custom ${isActive('/admin/orders')}`}>
                                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <span>Vận hành</span>
                                </Link>

                                <Link to="/tables" className={`nav-item-custom ${isActive('/tables')}`}>
                                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                    <span>Sơ đồ Bàn</span>
                                </Link>
                            </>
                        )}

                        {/* --- [MỚI] NHÓM 3: ADMIN CÓ THỂ XEM BẾP (Để kiểm tra) --- */}
                        {user.role === 'ADMIN' && (
                            <Link to="/kitchen" className={`nav-item-custom ${isActive('/kitchen')}`}>
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                <span>Screen Bếp</span>
                            </Link>
                        )}

                        {/* --- NHÓM 4: CHẤM CÔNG (PHÂN LUỒNG) --- */}

                        {/* Nếu là ADMIN -> Hiện nút xem Lịch sử */}
                        {user.role === 'ADMIN' && (
                            <Link to="/admin/timekeeping" className={`nav-item-custom ${isActive('/admin/timekeeping')}`}>
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <span>QL Chấm công</span>
                            </Link>
                        )}

                        {/* Nếu là NHÂN VIÊN (Thu ngân, Bếp) -> Hiện nút Chấm công FaceID */}
                        {['CASHIER', 'CHEF', 'STAFF'].includes(user.role) && (
                            <Link to="/checkin" className={`nav-item-custom ${isActive('/checkin')}`}>
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                <span>Chấm công AI</span>
                            </Link>
                        )}

                    </Nav>

                    {/* USER PROFILE SECTION (Giữ nguyên) */}
                    <div className="user-profile-wrapper">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user.username || 'Nhân viên'}</span>
                                <span className="user-role">{user.role || 'Staff'}</span>
                            </div>
                        </div>
                        <button className="btn-logout-icon" onClick={handleLogout} title="Đăng xuất">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MyNavbar;