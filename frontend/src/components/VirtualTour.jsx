import { useEffect, useRef } from 'react';
import './VirtualTour.css'; // Import file CSS vừa tạo

const VirtualTour = () => {
    const viewerRef = useRef(null);

    useEffect(() => {
        // Dọn dẹp container để tránh lỗi "con ruồi"
        const container = document.getElementById('panorama');
        if (container) container.innerHTML = '';

        if (window.pannellum) {
            viewerRef.current = window.pannellum.viewer('panorama', {
                "default": {
                    "firstScene": "entrance",
                    "author": "VIET RESTAURANT",
                    "sceneFadeDuration": 1500, // Hiệu ứng chuyển cảnh mượt hơn
                    "autoLoad": true,
                    "compass": true, // Hiện la bàn nếu muốn
                },
                "scenes": {
                    // --- CẢNH 1: CỔNG VÀO ---
                    "entrance": {
                        "title": "Sảnh Chính & Cổng Vào",
                        "hfov": 110,
                        "pitch": -3,
                        "yaw": 117,
                        "type": "equirectangular",
                        "panorama": "/images360/cong_vao.jpg",
                        "hotSpots": [
                            {
                                "pitch": -2.1,
                                "yaw": 132.9,
                                "type": "scene",
                                "text": "Đi vào Khu Bàn Tiệc 🍽️", // Thêm icon 
                                "sceneId": "dining"
                            }
                        ]
                    },

                    // --- CẢNH 2: BÀN TIỆC (Trung tâm) ---
                    "dining": {
                        "title": "Khu Vực Bàn Tiệc Chung",
                        "hfov": 110,
                        "yaw": 5,
                        "type": "equirectangular",
                        "panorama": "/images360/ban_tiec.jpg",
                        "hotSpots": [
                            {
                                "pitch": -0.6,
                                "yaw": 37.1,
                                "type": "scene",
                                "text": "Ra lại Cổng chính 🚪",
                                "sceneId": "entrance"
                            },
                            {
                                // chỉnh tọa độ này cho khớp ảnh thật
                                "pitch": 10,
                                "yaw": 180,
                                "type": "scene",
                                "text": "Vào Phòng VIP 👑", // Dẫn sang cảnh 3
                                "sceneId": "vip"
                            }
                        ]
                    },

                    // --- CẢNH 3: PHÒNG VIP (MỚI) ---
                    "vip": {
                        "title": "Phòng VIP Sang Trọng",
                        "hfov": 100,
                        "yaw": 0,
                        "type": "equirectangular",
                        "panorama": "/images360/phong_vip.jpg",
                        "hotSpots": [
                            {
                                "pitch": 0,    
                                "yaw": 180, 
                                "type": "scene",
                                "text": "Trở ra Bàn tiệc chung",
                                "sceneId": "dining"
                            }
                        ]
                    }
                }
            });
        }

        // Cleanup
        return () => {
            if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
                try { viewerRef.current.destroy(); } catch (e) { }
            }
            if (container) container.innerHTML = '';
            viewerRef.current = null;
        };
    }, []);

    return (
        <div className="vr-container-wrapper">
            <div id="panorama"></div>
        </div>
    );
};

export default VirtualTour;