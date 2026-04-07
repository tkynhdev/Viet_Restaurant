const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEED DATABASE VIET RESTAURANT ---');
    
    // 1. XÓA DÛ LIÊU CÙ
    console.log('1. Xóa dþ liêu cu...');
    
    try {
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.reservation.deleteMany();
        await prisma.chatSession.deleteMany();
        await prisma.menu.deleteMany();
        await prisma.table.deleteMany();
        await prisma.user.deleteMany();
        console.log('   - Xóa dþ liêu cu thành công');
    } catch (e) {
        console.log('   - Løi xóa (có thå bø qua):', e.message);
    }

    // 2. TÀO TÀI KHOAN ADMIN
    console.log('2. Tào tài khoan Admin...');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Tào admin vøi email admin@gmail.com theo yêu câu
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });
    console.log('   - Admin: admin@gmail.com (password: 123456)');

    // Tào thêm các tài khoan khác cho test
    await prisma.user.createMany({
        data: [
            { username: 'staff', email: 'staff@gmail.com', password: hashedPassword, role: 'STAFF' },
            { username: 'bep1', email: 'bep@gmail.com', password: hashedPassword, role: 'CHEF' },
            { username: 'thungan1', email: 'thungan@gmail.com', password: hashedPassword, role: 'CASHIER' },
            { username: 'khachhang', email: 'khach@gmail.com', password: hashedPassword, role: 'CUSTOMER' }
        ]
    });
    console.log('   - Tào thêm 4 tài khoan test (staff, bep, thungan, khachhang)');

    // 3. TÀO BÀN ÅN
    console.log('3. Tào bàn ån...');
    
    const tables = await prisma.table.createMany({
        data: [
            { name: 'Bàn 01', capacity: 2, status: 'EMPTY' },
            { name: 'Bàn 02', capacity: 2, status: 'EMPTY' },
            { name: 'Bàn 03', capacity: 4, status: 'EMPTY' },
            { name: 'Bàn 04', capacity: 4, status: 'EMPTY' },
            { name: 'Bàn 05', capacity: 6, status: 'EMPTY' },
            { name: 'Bàn 06', capacity: 6, status: 'EMPTY' },
            { name: 'Bàn VIP 01', capacity: 8, status: 'EMPTY' },
            { name: 'Bàn VIP 02', capacity: 10, status: 'EMPTY' },
        ]
    });
    console.log('   - Tào 8 bàn ån (2,4,6,8,10 chø)');

    // 4. TÀO MENU MÓN ÅN
    console.log('4. Tào menu món ån...');
    
    // Khai ví
    const khaiViItems = [
        {
            name: 'Gå Nim Tôm Chù',
            category: 'Khai Vý',
            price: 85000,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Chå Giø',
            category: 'Khai Vý',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Salad Nông Dân',
            category: 'Khai Vý',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        }
    ];

    // Món chính
    const monChinhItems = [
        {
            name: 'Phø Bø Spécial',
            category: 'Món Chính',
            price: 75000,
            image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Bún Bø Huý',
            category: 'Món Chính',
            price: 65000,
            image: 'https://images.unsplash.com/photo-1588166524942-2bec1acdd862?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Cøm Rang Dùa Bø',
            category: 'Món Chính',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Bún Chå Hà Nøi',
            category: 'Món Chính',
            price: 60000,
            image: 'https://images.unsplash.com/photo-1559847844-5a8d4a6d3e0c?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Mì Quång',
            category: 'Món Chính',
            price: 58000,
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        }
    ];

    // Món chay
    const monChayItems = [
        {
            name: 'Phø Chay Nåm Hø',
            category: 'Món Chay',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1540420773420-3366772dcbba?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Cøm Chay Rau Cåi',
            category: 'Món Chay',
            price: 40000,
            image: 'https://images.unsplash.com/photo-1512058424492-5a1b9b2b5b1c?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        }
    ];

    // Dø uông
    const doUongItems = [
        {
            name: 'Trà Lành Mãn',
            category: 'Dø Uông',
            price: 8000,
            image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Nøp Søi Dùa',
            category: 'Dø Uông',
            price: 12000,
            image: 'https://images.unsplash.com/photo-1575503577386-7575165f1e8d?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Bia Sài Gòn',
            category: 'Dø Uông',
            price: 18000,
            image: 'https://images.unsplash.com/photo-1607305357290-d4d184825852?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Cà Phê Sùa Dá',
            category: 'Dø Uông',
            price: 15000,
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Nøc Ép Cam',
            category: 'Dø Uông',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        }
    ];

    // Tráng miäng
    const trangMiengItems = [
        {
            name: 'Chè Ba Màu',
            category: 'Tráng Miäng',
            price: 22000,
            image: 'https://images.unsplash.com/photo-1568907345365-4e7a4b6c6f1c?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        },
        {
            name: 'Bánh Flan',
            category: 'Tráng Miäng',
            price: 18000,
            image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=200&fit=crop',
            isAvailable: true,
            model3dUrl: ''
        }
    ];

    // Tào tât cå món ån
    const allMenuItems = [
        ...khaiViItems,
        ...monChinhItems, 
        ...monChayItems,
        ...doUongItems,
        ...trangMiengItems
    ];

    await prisma.menu.createMany({
        data: allMenuItems
    });

    console.log(`   - Tào ${allMenuItems.length} món ån:`);
    console.log(`     * ${khaiViItems.length} món khai ví`);
    console.log(`     * ${monChinhItems.length} món chính`);
    console.log(`     * ${monChayItems.length} món chay`);
    console.log(`     * ${doUongItems.length} món dø uông`);
    console.log(`     * ${trangMiengItems.length} món tráng miäng`);

    // 5. THÓNG KÊ
    console.log('\n--- THÓNG KÊ DÞ LIÊU TÀO ---');
    console.log(`- Users: ${5} tài khoan`);
    console.log(`- Tables: ${8} bàn ån`);
    console.log(`- Menu: ${allMenuItems.length} món ån`);
    console.log(`- Admin login: admin@gmail.com / 123456`);
    
    console.log('\n--- SEED HOÀN TÁT ---');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });