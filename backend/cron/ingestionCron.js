const cron = require('node-cron');
const prisma = require('../config/prisma');

// Hàm tạo dữ liệu ngẫu nhiên
const generateRandomSale = () => {
    const departments = ['Sales', 'Marketing', 'IT', 'HR'];
    // DB Schema dashboard_1 cấu hình cột Province là varchar(10)
    // Nên phải dùng các tên tỉnh thành ngắn gọn, ví dụ "Hà Nội" (6 char), "TPHCM" (5 char)
    const provinces = ['Hà Nội', 'TPHCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
    const zones = ['Miền Bắc', 'Miền Nam', 'Miền Trung', 'Miền Bắc', 'Miền Nam'];
    
    const randomIdx = Math.floor(Math.random() * provinces.length);

    return {
        Order_Date: new Date(),
        Department: departments[Math.floor(Math.random() * departments.length)],
        Revenue: Math.floor(Math.random() * 50000000) + 1000000, // Doanh thu từ 1-50 triệu
        Province: provinces[randomIdx],
        Zone: zones[randomIdx] === 'Miền Bắc' ? 1.0 : (zones[randomIdx] === 'Miền Trung' ? 2.0 : 3.0) 
    };
};

const initIngestionCron = () => {
    // Chạy mỗi 5 phút (để giả lập có hệ thống khác đổ data sang)
    // Thực tế có thể là mỗi ngày hoặc khi có webhook
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Ingestion Cron] Bắt đầu tự động tạo dữ liệu mẫu...');
        try {
            // Nhét ngẫu nhiên 10 record mỗi lần
            const fakeDataBatch = Array.from({ length: 10 }, generateRandomSale);

            await prisma.dashboard_1.createMany({
                data: fakeDataBatch
            });

            console.log(`[Ingestion Cron] Đã thêm thành công ${fakeDataBatch.length} dòng dữ liệu giả lập vào MySQL.`);
        } catch (error) {
            console.error('[Ingestion Cron] Lỗi khi tạo dữ liệu mẫu:', error);
        }
    });

    console.log('Đã khởi tạo Node-Cron job cho Fake Data Ingestion (chạy mỗi 5 phút).');
};

module.exports = { initIngestionCron };
