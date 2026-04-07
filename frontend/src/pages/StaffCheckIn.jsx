import { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import MyNavbar from '../components/MyNavbar';
import { useNavigate } from 'react-router-dom';

// Import file CSS tùy chỉnh
import './StaffCheckIn.css';

const StaffCheckIn = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    // --- STATE HỆ THỐNG ---
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [userFaceData, setUserFaceData] = useState(null); // Dữ liệu mặt gốc từ DB
    const [isRegistering, setIsRegistering] = useState(false); // Chế độ đăng ký
    const [processing, setProcessing] = useState(false);

    // --- STATE KIỂM TRA ---
    const [gpsValid, setGpsValid] = useState(null);
    const [locationName, setLocationName] = useState('Đang định vị...');

    // --- CẤU HÌNH TỌA ĐỘ QUÁN ---
    const SHOP_LOCATION = {
        lat: 10.855022,
        lng: 106.785327
    };
    const MAX_DISTANCE_METERS = 7000; // 2km

    // 1. KHỞI TẠO: Load Model & Lấy thông tin User
    useEffect(() => {
        const loadResources = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);

                const token = localStorage.getItem('token');
                if (!token) return navigate('/login');

                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.faceData) {
                    const floatArray = new Float32Array(Object.values(res.data.faceData));
                    setUserFaceData(floatArray);
                }

                checkGPS();

            } catch (err) {
                console.error(err);
                toast.error("Lỗi tải AI hoặc kết nối Server");
            }
        };
        loadResources();
    }, []);

    // 2. HÀM KIỂM TRA GPS
    const checkGPS = () => {
        if (!navigator.geolocation) {
            toast.error("Trình duyệt không hỗ trợ GPS");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const distance = getDistanceFromLatLonInKm(latitude, longitude, SHOP_LOCATION.lat, SHOP_LOCATION.lng) * 1000;

                console.log(`Khoảng cách: ${distance.toFixed(0)}m`);

                if (distance <= MAX_DISTANCE_METERS) {
                    setGpsValid(true);
                    setLocationName(`Hợp lệ (${distance.toFixed(0)}m)`);
                } else {
                    setGpsValid(false);
                    setLocationName(`Quá xa quán (${distance.toFixed(0)}m)`);
                }
            },
            (err) => {
                console.error(err);
                setGpsValid(false);
                setLocationName("Không thể lấy vị trí (Bật GPS lên)");
            }
        );
    };

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLon = (lon2 - lon1) * (Math.PI / 180);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 3. HÀM PHÁT HIỆN KHUÔN MẶT
    const detectFace = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor()
                .withFaceExpressions();
            return detection;
        }
        return null;
    };

    // 4. XỬ LÝ: ĐĂNG KÝ KHUÔN MẶT
    const handleRegister = async () => {
        setProcessing(true);
        const detection = await detectFace();

        if (!detection) {
            toast.warning("⚠️ Không tìm thấy khuôn mặt! Giữ yên đầu.");
            setProcessing(false);
            return;
        }

        try {
            const faceArray = Array.from(detection.descriptor);
            const token = localStorage.getItem('token');

            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register-face`, { faceData: faceArray }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("✅ Đăng ký khuôn mặt thành công!");
            setUserFaceData(detection.descriptor);
            setIsRegistering(false);
        } catch (err) {
            toast.error("Lỗi khi lưu dữ liệu");
        } finally {
            setProcessing(false);
        }
    };

    // 5. XỬ LÝ: CHẤM CÔNG
    const handleCheckIn = async () => {
        if (!gpsValid) return toast.error("❌ Bạn đang ở quá xa vị trí quán!");
        setProcessing(true);

        const detection = await detectFace();

        if (!detection) {
            toast.warning("⚠️ Không thấy mặt! Vui lòng nhìn thẳng camera.");
            setProcessing(false);
            return;
        }

        if (detection.expressions.happy < 0.5) {
            toast.warning("😐 Hãy cười lên để xác thực người thật!");
            setProcessing(false);
            return;
        }

        if (userFaceData) {
            const distance = faceapi.euclideanDistance(detection.descriptor, userFaceData);

            if (distance < 0.5) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/timekeeping`, {
                        location: locationName,
                        distance: locationName.match(/\d+/)[0]
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    toast.success(`🎉 CHẤM CÔNG THÀNH CÔNG! Admin đã nhận được thông tin.`);
                } catch (err) {
                    toast.error("Lỗi server khi lưu chấm công");
                }
            } else {
                toast.error("⛔ Khuôn mặt không khớp! Vui lòng thử lại.");
            }
        }
        setProcessing(false);
    };

    return (
        <>
            <MyNavbar />
            {/* Class checkin-container cho nền */}
            <div className="checkin-container d-flex justify-content-center align-items-center py-5">
                {/* Class checkin-card cho khung */}
                <Card className="checkin-card shadow-lg border-0">

                    {/* Header */}
                    <Card.Header className="checkin-header text-center py-3">
                        <h4 className="mb-0 fw-bold"><i className="bi bi-person-bounding-box me-2"></i>Smart Check-in AI</h4>
                    </Card.Header>

                    <Card.Body className="text-center p-4">

                        {/* 1. TRẠNG THÁI GPS */}
                        <div className="mb-4">
                            <h6 className="text-muted text-uppercase small fw-bold mb-2">1. Vị trí làm việc</h6>
                            {gpsValid === null && <Badge bg="warning" className="gps-status">📍 Đang định vị...</Badge>}
                            {gpsValid === true && <Badge bg="success" className="gps-status">✅ GPS Hợp lệ: {locationName}</Badge>}
                            {gpsValid === false && <Badge bg="danger" className="gps-status">❌ GPS Sai: {locationName}</Badge>}
                        </div>

                        {/* 2. CAMERA - Sử dụng class .camera-wrapper và .face-guide-overlay */}
                        {modelsLoaded ? (
                            <div className="camera-wrapper mx-auto mb-4">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                                {/* Khung ngắm khuôn mặt */}
                                <div className="face-guide-overlay"></div>
                            </div>
                        ) : (
                            <div className="py-5"><Spinner animation="border" variant="primary" /> <p>Đang tải trí tuệ nhân tạo...</p></div>
                        )}

                        {/* 3. ĐIỀU KHIỂN */}
                        <div>
                            {!userFaceData ? (
                                // --- CHẾ ĐỘ ĐĂNG KÝ ---
                                <div className="alert alert-info border-0 shadow-sm">
                                    <strong>Chưa có dữ liệu khuôn mặt.</strong><br />
                                    Vui lòng nhìn thẳng camera và đăng ký lần đầu.
                                    <div className="mt-3">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleRegister}
                                            disabled={processing}
                                            className="btn-checkin-action w-100 fw-bold"
                                        >
                                            {processing ? <Spinner size="sm" /> : "📸 Chụp ảnh & Lưu Dữ Liệu"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // --- CHẾ ĐỘ CHẤM CÔNG ---
                                <div>
                                    <h6 className="text-muted text-uppercase small fw-bold mb-2">2. Xác thực sinh trắc học</h6>
                                    <Button
                                        variant={gpsValid ? "success" : "secondary"}
                                        size="lg"
                                        onClick={handleCheckIn}
                                        disabled={!gpsValid || processing}
                                        className="btn-checkin-action w-100 fw-bold shadow-sm"
                                    >
                                        {processing ? <Spinner size="sm" /> : "📍 CƯỜI LÊN ĐỂ CHẤM CÔNG 😄"}
                                    </Button>

                                    <div className="mt-3">
                                        <Button variant="link" className="text-muted small text-decoration-none" onClick={() => { if (window.confirm('Bạn muốn xóa dữ liệu cũ để đăng ký lại?')) { setUserFaceData(null); } }}>
                                            🔄 Đăng ký lại khuôn mặt
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};

export default StaffCheckIn;