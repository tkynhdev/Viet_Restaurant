import React from 'react';

// --- CHÚ Ý: Phải có chữ 'export' ở đầu ---
export const Invoice = React.forwardRef(({ order }, ref) => {
    if (!order) return <div ref={ref}>Loading...</div>;

    return (
        <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, textTransform: 'uppercase' }}>VIET RESTAURANT</h2>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>Khu Công Nghệ Cao, TP.HCM</p>
                <p style={{ margin: 0, fontSize: '14px' }}>Hotline: 0967877911</p>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                <p style={{ margin: '5px 0' }}><strong>Mã hóa đơn:</strong> #{order.id}</p>
                <p style={{ margin: '5px 0' }}><strong>Ngày:</strong> {new Date().toLocaleString()}</p>
                <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {order.user?.username || order.reservation?.name || 'Khách lẻ'}</p>
                <p style={{ margin: '5px 0' }}><strong>Bàn:</strong> {order.table ? order.table.name : 'Mang về'}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Tên món</th>
                        <th style={{ textAlign: 'center', padding: '8px 0' }}>SL</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Đơn giá</th>
                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px dashed #ccc' }}>
                            <td style={{ padding: '8px 0' }}>{item.menu ? item.menu.name : 'Món đã xóa'}</td>
                            <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', padding: '8px 0' }}>{item.price.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', padding: '8px 0' }}>{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <h3 style={{ margin: 0 }}>TỔNG CỘNG: {order.totalPrice.toLocaleString()} VNĐ</h3>
                <p style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '5px' }}>(Đã bao gồm VAT)</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '10px' }}>
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p>Wifi: ThinhDepTrai / Pass: 88888888</p>
            </div>
        </div>
    );
});

Invoice.displayName = 'Invoice';