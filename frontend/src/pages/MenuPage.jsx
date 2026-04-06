import { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import './MenuPage.css';
// --- 1. Import model-viewer (Bắt buộc) ---
import '@google/model-viewer';

const MenuPage = () => {
    const [menus, setMenus] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // State form dữ liệu
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('DoAn');
    const [imageFile, setImageFile] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    // --- State mới cho AR ---
    const [model3dUrl, setModel3dUrl] = useState(''); // Lưu link file .glb
    const [showARModal, setShowARModal] = useState(false); // Modal xem AR
    const [selectedModel, setSelectedModel] = useState(''); // Model đang xem

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/menu');
            setMenus(res.data);
        } catch (err) {
            toast.error('Lỗi kết nối server!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('isAvailable', isAvailable);
        // Gửi link 3D lên server
        formData.append('model3dUrl', model3dUrl);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingItem) {
                await axios.put(`http://localhost:5000/api/menu/${editingItem.id}`, formData, config);
                toast.success('Đã cập nhật món ăn!');
            } else {
                await axios.post('http://localhost:5000/api/menu', formData, config);
                toast.success('Thêm món mới thành công!');
            }
            handleClose();
            fetchMenus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa món này không?')) {
            try {
                await axios.delete(`http://localhost:5000/api/menu/${id}`, config);
                toast.success('Đã xóa món ăn!');
                fetchMenus();
            } catch (err) {
                toast.error('Không thể xóa món này!');
            }
        }
    };

    const handleShow = (item = null) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setPrice(item.price);
            setCategory(item.category);
            setIsAvailable(item.isAvailable);
            // Load link 3D cũ lên form
            setModel3dUrl(item.model3dUrl || '');
            setImageFile(null);
        } else {
            setEditingItem(null);
            setName('');
            setPrice('');
            setCategory('DoAn');
            setIsAvailable(true);
            setModel3dUrl('');
            setImageFile(null);
        }
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    return (
        <>
            <MyNavbar />
            <Container className="page-container">
                <div className="page-header">
                    <h2 className="page-title">🍽️ Quản lý Thực đơn</h2>
                    <Button className="btn-add-new" onClick={() => handleShow(null)}>
                        + Thêm món mới
                    </Button>
                </div>

                <div className="menu-grid">
                    {menus.map((item) => (
                        <div className="food-card" key={item.id}>
                            <div className="card-image-wrapper">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="food-image" />
                                ) : (
                                    <div className="no-image-placeholder">No Image</div>
                                )}
                                <div className="card-badges">
                                    {item.category === 'DoAn'
                                        ? <span className="badge-custom badge-food">Đồ ăn</span>
                                        : <span className="badge-custom badge-drink">Đồ uống</span>}

                                    {!item.isAvailable &&
                                        <span className="badge-custom badge-out">Hết hàng</span>
                                    }

                                    {/* --- Badge AR (Mới) --- */}
                                    {item.model3dUrl && (
                                        <span
                                            className="badge-custom bg-info text-white"
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Tránh click nhầm vào ảnh
                                                setSelectedModel(item.model3dUrl);
                                                setShowARModal(true);
                                            }}
                                        >
                                            <i className="bi bi-box-seam me-1"></i> 3D View
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body-custom">
                                <div className="card-info">
                                    <h3 className="food-title">{item.name}</h3>
                                    <p className="food-price">{item.price.toLocaleString()} đ</p>
                                </div>

                                <div className="card-actions">
                                    <Button className="btn-action-edit" onClick={() => handleShow(item)}>
                                        Sửa
                                    </Button>
                                    <Button className="btn-action-delete" onClick={() => handleDelete(item.id)}>
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Thêm/Sửa */}
                <Modal show={showModal} onHide={handleClose} backdrop="static" centered className="modal-custom">
                    <Modal.Header closeButton>
                        <Modal.Title>{editingItem ? 'Sửa món ăn' : 'Thêm món mới'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên món ăn</Form.Label>
                                <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giá (VNĐ)</Form.Label>
                                        <Form.Control type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Danh mục</Form.Label>
                                        <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
                                            <option value="DoAn">Đồ ăn</option>
                                            <option value="DoUong">Đồ uống</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* --- Ô NHẬP LINK 3D (MỚI) --- */}
                            <Form.Group className="mb-3">
                                <Form.Label>File Model 3D (.glb)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="/models/ten_file.glb"
                                    value={model3dUrl}
                                    onChange={e => setModel3dUrl(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Copy file .glb vào thư mục <code>frontend/public/models</code> rồi nhập đường dẫn vào đây.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh minh họa</Form.Label>
                                <Form.Control type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    label="Đang bán"
                                    checked={isAvailable}
                                    onChange={e => setIsAvailable(e.target.checked)}
                                    className="custom-switch"
                                />
                            </Form.Group>

                            <div className="d-grid gap-2">
                                <Button className="btn-submit-modal" type="submit" size="lg">
                                    {editingItem ? 'Cập nhật' : 'Lưu mới'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* --- MODAL HIỂN THỊ AR (MỚI) --- */}
                <Modal show={showARModal} onHide={() => setShowARModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Xem trước AR/3D</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0 bg-light" style={{ height: '500px' }}>
                        {/* Thẻ model-viewer của Google */}
                        <model-viewer
                            src={selectedModel}
                            alt="A 3D model"
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            camera-controls
                            auto-rotate
                            shadow-intensity="1"
                            style={{ width: '100%', height: '100%' }}
                        >
                            <div className="progress-bar hide" slot="progress-bar">
                                <div className="update-bar"></div>
                            </div>
                            <Button slot="ar-button" variant="primary" className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                                👋 Xem trong không gian thực
                            </Button>
                        </model-viewer>
                    </Modal.Body>
                </Modal>

            </Container>
        </>
    );
};

export default MenuPage;