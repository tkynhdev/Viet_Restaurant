import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Bootstrap CSS và Toastify CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider> { }
      <App />
    </CartProvider>
  </React.StrictMode>,
)