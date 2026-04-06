import { useState, useEffect } from 'react';
// 1. THÊM IMPORT CẦN THIẾT CHO AI VÀ UI
import { Container, Row, Col, Form, Spinner, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import { Bar } from 'react-chartjs-2';
import './DashboardPage.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getTodayString = () => new Date().toISOString().split('T')[0];

const DashboardPage = () => {
    // --- STATE CŨ (GIỮ NGUYÊN) ---
    const [report, setReport] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [topDishes, setTopDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: getTodayString(),
        to: getTodayString()
    });

    // --- 2. STATE MỚI CHO AI DỰ BÁO ---
    const [aiForecast, setAiForecast] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [revenueRes, topDishesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/reports/revenue?from=${dateRange.from}&to=${dateRange.to}`, config),
                axios.get(`http://localhost:5000/api/reports/top-dishes`, config)
            ]);
            setReport(revenueRes.data);
            setTopDishes(topDishesRes.data);
        } catch (err) {
            toast.error('Lỗi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. HÀM GỌI AI DỰ BÁO (MỚI) ---
    const handleGetForecast = async () => {
        setLoadingAI(true);
        try {
            const res = await axios.get('http://localhost:5000/api/reports/forecast', config);
            setAiForecast(res.data);
            toast.success("AI đã phân tích xong!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi gọi AI dự báo: " + (err.response?.data?.message || err.message));
        } finally {
            setLoadingAI(false);
        }
    };

    const chartData = {
        labels: topDishes.map(d => d.name),
        datasets: [{
            label: 'Số lượng đã bán',
            data: topDishes.map(d => d.totalSold),
            backgroundColor: 'rgba(234, 88, 12, 0.8)',
            borderColor: '#ea580c',
            borderWidth: 1,
            borderRadius: 4,
        }]
    };

    return (
        <>
            <MyNavbar />
            <Container className="dashboard-container">
                <div className="dashboard-header">
                    <h2 className="page-title">📊 Dashboard Tổng quan</h2>
                    <span className="current-date">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
                </div>

                {/* BỘ LỌC NGÀY (GIỮ NGUYÊN) */}
                <div className="filter-panel">
                    <div className="filter-title">Bộ lọc thời gian</div>
                    <div className="filter-inputs">
                        <Form.Group className="date-input-group">
                            <Form.Label>Từ ngày</Form.Label>
                            <Form.Control
                                type="date"
                                className="custom-date-control"
                                value={dateRange.from}
                                onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                            />
                        </Form.Group>
                        <div className="date-arrow">➝</div>
                        <Form.Group className="date-input-group">
                            <Form.Label>Đến ngày</Form.Label>
                            <Form.Control
                                type="date"
                                className="custom-date-control"
                                value={dateRange.to}
                                onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                            />
                        </Form.Group>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Spinner animation="border" className="custom-spinner" />
                        <p>Đang tổng hợp số liệu...</p>
                    </div>
                ) : (
                    <>
                        {/* CÁC THẺ SỐ LIỆU (GIỮ NGUYÊN) */}
                        <div className="stats-grid">
                            <div className="stat-card revenue-card">
                                <div className="stat-icon-bg">💰</div>
                                <div className="stat-content">
                                    <h4 className="stat-title">Tổng Doanh thu</h4>
                                    <h2 className="stat-value">{report.totalRevenue.toLocaleString()} <span className="currency">đ</span></h2>
                                    <p className="stat-desc">Doanh thu thực tế trong kỳ</p>
                                </div>
                            </div>

                            <div className="stat-card orders-card">
                                <div className="stat-icon-bg">📦</div>
                                <div className="stat-content">
                                    <h4 className="stat-title">Tổng Đơn hàng</h4>
                                    <h2 className="stat-value">{report.totalOrders} <span className="unit">đơn</span></h2>
                                    <p className="stat-desc">Đơn đã thanh toán thành công</p>
                                </div>
                            </div>
                        </div>

                        {/* BIỂU ĐỒ (GIỮ NGUYÊN) */}
                        <div className="chart-section">
                            <div className="chart-header">
                                <h5 className="chart-title">🏆 Top Món bán chạy nhất</h5>
                            </div>
                            <div className="chart-body">
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            title: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: '#f3f4f6' }
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* --- 4. PHẦN AI DỰ BÁO (MỚI THÊM VÀO CUỐI) --- */}
                        {/* Sử dụng style inline hoặc bootstrap classes để không ảnh hưởng css cũ */}
                        <Card className="ai-card mt-5">
                            <Card.Header className="ai-header d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2 text-white">
                                    <span className="fs-3">🤖</span>
                                    <h5 className="mb-0">Trợ lý AI: Phân tích & Dự báo</h5>
                                </div>
                                <Button
                                    className="btn-ai-analyze"
                                    variant="light"
                                    onClick={handleGetForecast}
                                    disabled={loadingAI}
                                >
                                    {loadingAI ? <><Spinner as="span" animation="border" size="sm" className="me-2" />AI đang suy nghĩ...</> : '⚡ Phân tích ngay'}
                                </Button>
                            </Card.Header>

                            <Card.Body className="bg-light p-4">
                                {!aiForecast ? (
                                    <div className="text-center py-5 text-muted">
                                        <div className="mb-3" style={{ fontSize: '4rem', opacity: 0.2 }}>🔮</div>
                                        <h5>Dữ liệu đã sẵn sàng!</h5>
                                        <p>Nhấn nút <strong>"Phân tích ngay"</strong> để AI đọc dữ liệu 30 ngày qua<br />và đưa ra chiến lược kinh doanh cho ngày mai.</p>
                                    </div>
                                ) : (
                                    <Row className="g-4">
                                        {/* CỘT 1: XU HƯỚNG */}
                                        <Col md={4}>
                                            <Card className="ai-sub-card h-100">
                                                <Card.Body>
                                                    <div className="ai-card-title text-trend">
                                                        <i className="bi bi-graph-up-arrow"></i> Xu hướng & Dự báo
                                                    </div>
                                                    <Alert variant="primary" className="small mb-3 border-0" style={{ background: '#e7f1ff', color: '#004085' }}>
                                                        {aiForecast.trend_analysis}
                                                    </Alert>

                                                    <div className="forecast-box">
                                                        <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>DOANH THU DỰ KIẾN NGÀY MAI</small>
                                                        <div className="forecast-money">
                                                            {aiForecast.forecast?.revenue_tomorrow?.toLocaleString()} đ
                                                        </div>
                                                        <div className="badge bg-secondary pill px-3 py-2">{aiForecast.forecast?.order_count_tomorrow} đơn dự kiến</div>
                                                    </div>
                                                    <p className="ai-desc-text mt-3">
                                                        "{aiForecast.forecast?.reasoning}"
                                                    </p>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        {/* CỘT 2: NHẬP KHO */}
                                        <Col md={4}>
                                            <Card className="ai-sub-card h-100">
                                                <Card.Body>
                                                    <div className="ai-card-title text-inventory">
                                                        <i className="bi bi-box-seam"></i> Tư vấn Nhập kho
                                                    </div>

                                                    <div className="ai-advice-box">
                                                        <strong className="d-block mb-2 text-dark">Hành động:</strong>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{aiForecast.inventory_advice?.action}</span>
                                                    </div>

                                                    <p className="text-secondary small mt-3">
                                                        <strong>Chi tiết:</strong> {aiForecast.inventory_advice?.details}
                                                    </p>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        {/* CỘT 3: CẢNH BÁO */}
                                        <Col md={4}>
                                            <Card className="ai-sub-card h-100">
                                                <Card.Body>
                                                    <div className="ai-card-title text-alert">
                                                        <i className="bi bi-shield-exclamation"></i> Lưu ý quan trọng
                                                    </div>

                                                    {aiForecast.alert ? (
                                                        <div className="ai-alert-box">
                                                            {aiForecast.alert}
                                                        </div>
                                                    ) : (
                                                        <div className="ai-success-box">
                                                            <div className="fs-1 mb-2">✅</div>
                                                            <h6 className="fw-bold">Tuyệt vời!</h6>
                                                            <p className="mb-0 small">Mọi chỉ số kinh doanh đều đang ổn định. Không có rủi ro bất thường.</p>
                                                        </div>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Container>
        </>
    );
};

export default DashboardPage;