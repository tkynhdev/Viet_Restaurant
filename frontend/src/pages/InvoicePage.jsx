import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { Invoice } from '../components/Invoice'; // Tận dụng lại component Invoice cũ

const InvoicePage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                // Gọi API lấy chi tiết đơn hàng (Chúng ta tận dụng API lấy danh sách rồi lọc, hoặc gọi API chi tiết nếu có)
                // Ở đây ta gọi API lấy danh sách rồi tìm (để đỡ phải viết thêm API backend mới)
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, config);
                const foundOrder = res.data.find(o => o.id === parseInt(id));
                setOrder(foundOrder);

                // Tự động in sau khi dữ liệu load xong
                if (foundOrder) {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            }
        };
        fetchOrder();
    }, [id]);

    if (!order) return <div className="text-center mt-5"><Spinner animation="border" /> Đang tạo hóa đơn...</div>;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Invoice order={order} />
        </div>
    );
};

export default InvoicePage;