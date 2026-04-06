import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Import CSS toàn cục

// 1. IMPORT CONTEXT
import { CartProvider } from './context/CartContext';

// IMPORT CÁC TRANG
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import HomePage from './pages/HomePage';
// import ReservationPage from './pages/ReservationPage'; // (Đã xóa, gộp vào AdminOrderPage)
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import AdminOrderPage from './pages/AdminOrderPage';
import TableManagerPage from './pages/TableManagerPage';
import PaymentResult from './pages/PaymentResult';
import DashboardPage from './pages/DashboardPage';
import StaffPage from './pages/StaffPage';
import KitchenPage from './pages/KitchenPage';
import InvoicePage from './pages/InvoicePage';
import StaffCheckIn from './pages/StaffCheckIn'; // <--- Import trang Chấm công
import AdminTimekeepingPage from './pages/AdminTimekeepingPage';
// IMPORT COMPONENTS
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Component bảo vệ riêng cho Bếp
const ChefGuard = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  // Nếu là CHEF mà cố tình vào trang khác (trừ login và checkin), đá về kitchen
  if (user && user.role === 'CHEF' &&
    location.pathname !== '/kitchen' &&
    location.pathname !== '/login' &&
    location.pathname !== '/checkin') { // <--- Cho phép bếp vào Checkin
    return <Navigate to="/kitchen" replace />;
  }
  return children;
};

function App() {
  // Lấy role để điều hướng fallback thông minh
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user ? user.role : null;

  return (
    <BrowserRouter>
      <CartProvider>
        {/* Cấu hình Toastify toàn cục */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Chatbot hiển thị trên mọi trang (Trừ trang bếp cho đỡ rối) */}
        {role !== 'CHEF' && <ChatWidget />}

        <ChefGuard>
          <Routes>
            {/* --- KHU VỰC CÔNG KHAI --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment-result" element={<PaymentResult />} />

            {/* Route in hóa đơn (Mở tab mới nên ai có link cũng xem được hoặc bảo vệ tùy ý) */}
            <Route path="/print-invoice/:id" element={<InvoicePage />} />

            {/* --- KHU VỰC BẢO VỆ (User/Admin) --- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* --- KHU VỰC ADMIN --- */}
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/timekeeping" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminTimekeepingPage /></ProtectedRoute>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MenuPage />
                </ProtectedRoute>
              }
            />

            {/* --- KHU VỰC VẬN HÀNH (ADMIN & THU NGÂN) --- */}
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}>
                  <AdminOrderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tables"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}>
                  <TableManagerPage />
                </ProtectedRoute>
              }
            />

            {/* --- CHẤM CÔNG (MỌI NHÂN VIÊN) --- */}
            <Route
              path="/checkin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'CHEF', 'CASHIER']}>
                  <StaffCheckIn />
                </ProtectedRoute>
              }
            />

            {/* --- BẾP ONLY --- */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={['CHEF', 'ADMIN']}>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/timekeeping"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminTimekeepingPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback thông minh: Điều hướng về trang phù hợp với Role */}
            <Route path="*" element={<Navigate to={
              role === 'CHEF' ? '/kitchen' :
                (role === 'ADMIN' || role === 'CASHIER' ? '/admin/orders' : '/')
            } />} />

          </Routes>
        </ChefGuard>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;