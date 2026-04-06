import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Thêm món (Mặc định sẽ được Tick chọn luôn: checked: true)
    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, checked: true }];
        });
    };

    // Giảm số lượng
    const decreaseQuantity = (id) => {
        setCart((prev) => {
            return prev.map(item => {
                if (item.id === id) return { ...item, quantity: item.quantity - 1 };
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => setCart([]);

    // --- HÀM MỚI QUAN TRỌNG: Đảo trạng thái Tick ---
    const toggleCheck = (id) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    // Tính tổng tiền (CHỈ TÍNH NHỮNG MÓN CÓ checked = true)
    const totalPrice = cart
        .filter(item => item.checked)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, toggleCheck, totalPrice, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);