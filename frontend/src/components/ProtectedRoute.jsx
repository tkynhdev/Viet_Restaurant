import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Kiểm tra xem có token trong kho lưu trữ không
    const token = localStorage.getItem('token');

    // Nếu không có token -> Đá về trang Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có token -> Cho phép vào trang
    return children;
};

export default ProtectedRoute;