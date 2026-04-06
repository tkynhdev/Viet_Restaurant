const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Đang xóa dữ liệu cũ...');

    // --- PHẦN BẮT BUỘC PHẢI THÊM ĐỂ TRÁNH LỖI ---
    // Phải xóa các bảng con mới trước, nếu không sẽ lỗi khóa ngoại
    try {
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.reservation.deleteMany();
        await prisma.chatSession.deleteMany(); // Bảng AI
        await prisma.menu.deleteMany();
        await prisma.table.deleteMany();
        await prisma.user.deleteMany();
    } catch (e) {
        console.log('Lỗi xóa nhẹ (có thể bỏ qua):', e.message);
    }
    // ---------------------------------------------

    console.log('🌱 Đang tạo dữ liệu mẫu...');

    // 1. Tạo Admin (Mật khẩu là 123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // --- USER: Giữ nguyên Admin/Staff cũ, nhưng thêm Bếp/Thu ngân để test tính năng mới ---
    await prisma.user.createMany({
        data: [
            // Code cũ của bạn
            { username: 'admin', password: hashedPassword, role: 'ADMIN', email: 'admin@test.com' }, // Thêm email giả để đỡ lỗi
            { username: 'staff', password: hashedPassword, role: 'STAFF', email: 'staff@test.com' },

            // BẮT BUỘC THÊM 3 ô nảy để test tính năng Bếp và Thu ngân bạn vừa làm
            { username: 'bep1', password: hashedPassword, role: 'CHEF', email: 'bep@test.com' },
            { username: 'thungan1', password: hashedPassword, role: 'CASHIER', email: 'thungan@test.com' },
            { username: 'khach1', password: hashedPassword, role: 'CUSTOMER', email: 'khach@test.com' }
        ]
    });

    // 3. Tạo Bàn ăn (Giữ nguyên code bạn gửi)
    await prisma.table.createMany({
        data: [
            { name: 'Bàn 01', capacity: 2, status: 'EMPTY' },
            { name: 'Bàn 02', capacity: 4, status: 'EMPTY' },
            { name: 'Bàn 03', capacity: 6, status: 'OCCUPIED' },
            { name: 'Bàn VIP', capacity: 10, status: 'EMPTY' },
        ],
    });

    // 4. Tạo Món ăn (Giữ nguyên code bạn gửi + thêm model3dUrl rỗng)
    await prisma.menu.createMany({
        data: [
            {
                name: 'Phở Bò Đặc Biệt',
                category: 'DoAn',
                price: 50000,
                image: 'https://placehold.co/200x200?text=Pho+Bo', // Ảnh cũ
                isAvailable: true,
                model3dUrl: '' // Bắt buộc thêm để khớp database
            },
            {
                name: 'Cơm Rang Dưa Bò',
                category: 'DoAn',
                price: 45000,
                image: 'https://placehold.co/200x200?text=Com+Rang',
                isAvailable: true,
                model3dUrl: ''
            },
            {
                name: 'Trà Đá',
                category: 'DoUong',
                price: 5000,
                image: 'https://placehold.co/200x200?text=Tra+Da',
                isAvailable: true,
                model3dUrl: ''
            },
            {
                name: 'Pepsi Tươi',
                category: 'DoUong',
                price: 15000,
                image: 'https://placehold.co/200x200?text=Pepsi',
                isAvailable: true,
                model3dUrl: ''
            },
        ],
    });

    console.log('✅ Đã tạo dữ liệu mẫu thành công!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });