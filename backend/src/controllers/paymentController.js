const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Hàm sắp xếp tham số (Bắt buộc theo chuẩn VNPAY)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// 1. TẠO URL THANH TOÁN
exports.createPaymentUrl = async (req, res) => {
    try {
        const { amount, bankCode, language, orderId } = req.body;

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        // Lấy IP của người dùng
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        // Lấy config từ .env
        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        // Tạo tham số VNPAY
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng của mình
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPAY tính đơn vị là hào (nhân 100)
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp
        vnp_Params = sortObject(vnp_Params);

        // Ký số (HMAC SHA512)
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        // Tạo link cuối cùng
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.json({ paymentUrl: vnpUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi tạo link thanh toán' });
    }
};

// 2. XỬ LÝ KẾT QUẢ TRẢ VỀ (VNPAY)
exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);
        let secretKey = process.env.VNP_HASH_SECRET;
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            let updatedOrder;

            if (rspCode === '00') { // Thành công
                updatedOrder = await prisma.order.update({
                    where: { id: parseInt(orderId) },
                    data: {
                        paymentStatus: 'PAID',
                        orderStatus: 'CONFIRMED'
                    },
                    include: { user: true, reservation: true, table: true, items: { include: { menu: true } } }
                });

                await prisma.payment.create({
                    data: {
                        orderId: parseInt(orderId),
                        amount: vnp_Params['vnp_Amount'] / 100,
                        bankCode: vnp_Params['vnp_BankCode'],
                        transactionNo: vnp_Params['vnp_TransactionNo'],
                        orderInfo: vnp_Params['vnp_OrderInfo'],
                        status: '1'
                    }
                });

                res.json({ status: 'success', message: 'Giao dịch thành công' });

            } else { // Thất bại
                updatedOrder = await prisma.order.update({
                    where: { id: parseInt(orderId) },
                    data: {
                        paymentStatus: 'FAILED',
                        orderStatus: 'FAILED'
                    },
                    include: { user: true, reservation: true, table: true, items: { include: { menu: true } } }
                });
                res.json({ status: 'failed', message: 'Giao dịch thất bại' });
            }

            // Gửi thông báo real-time sau khi xử lý
            const io = req.app.get('socketio');
            io.emit('order_updated', updatedOrder);
            if (updatedOrder.userId) {
                io.to(updatedOrder.userId.toString()).emit('order_status_updated', updatedOrder);
            }

        } else {
            res.status(400).json({ status: 'error', message: 'Chữ ký không hợp lệ' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi xử lý VNPAY Return' });
    }
};
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}