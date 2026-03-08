const cron = require('node-cron');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Cấu hình Nodemailer transport
// Nên sử dụng biến môi trường (process.env) trong thực tế
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER || 'your_email@example.com',
        pass: process.env.SMTP_PASS || 'your_password'
    }
});

const generateAndSendReport = async () => {
    console.log('Bắt đầu cronjob sinh báo cáo tự động...');
    const timestamp = Date.now();
    const screenshotPath = path.join(__dirname, `../uploads/dashboard_${timestamp}.png`);
    
    let browser;
    try {
        // Đảm bảo thư mục uploads tồn tại
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Khởi động trình duyệt Puppeteer (chế độ ẩn - headless)
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        
        // Cài đặt kích thước màn hình phổ biến cho dashboard
        await page.setViewport({ width: 1920, height: 1080 });

        // Điều hướng tới URL của Dashboard (giả định Frontend chạy ở cổng 3000)
        const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard/report-view';
        
        // Ở thực tế: Bạn có thể cần set cookie auth hoặc tạo một secret route không cần login chỉ dành cho puppeteer
        console.log(`Đang chụp ảnh tại: ${dashboardUrl}`);
        
        await page.goto(dashboardUrl, { 
            waitUntil: 'networkidle0', // Đợi cho đến khi không còn request network nào (charts đã load xong)
            timeout: 60000 
        });

        // Chụp ảnh màn hình toàn bộ trang
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Đã lưu ảnh báo cáo tại: ${screenshotPath}`);

        // Gửi email
        const mailOptions = {
            from: '"Hệ thống Mini BI" <no-reply@minibi.com>',
            to: 'director@company.com, managers@company.com',
            subject: 'Báo cáo Doanh nghiệp Tổng hợp - Tuần mới',
            text: 'Chào bạn,\n\nGửi bạn báo cáo tổng hợp doanh thu tuần mới. Vui lòng xem ảnh đính kèm chi tiết.\n\nTrân trọng,\nHệ thống tự động',
            html: '<p>Chào bạn,</p><p>Gửi bạn báo cáo tổng hợp doanh thu tuần mới. Vui lòng xem ảnh đính kèm chi tiết.</p><p>Trân trọng,<br>Hệ thống tự động</p>',
            attachments: [
                {
                    filename: 'Weekly_Dashboard_Report.png',
                    path: screenshotPath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Đã gửi email báo cáo thành công: %s', info.messageId);

    } catch (error) {
        console.error('Lỗi trong quá trình tạo hoặc gửi báo cáo:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        
        // (Optional) Xóa ảnh sau khi gửi để tiết kiệm dung lượng
        if (fs.existsSync(screenshotPath)) {
            fs.unlinkSync(screenshotPath);
            console.log('Đã xóa tệp ảnh tạm.');
        }
    }
};

const initCronJobs = () => {
    // Chạy vào 8:00 AM mỗi sáng Thứ Hai hàng tuần
    // Cú pháp cron: Phút Giờ Ngày-trong-tháng Tháng Ngày-trong-tuần
    cron.schedule('0 8 * * 1', () => {
        console.log('Chạy tác vụ gửi báo cáo tự động (8:00 AM Thứ Hai)');
        generateAndSendReport();
    });
    
    console.log('Đã khởi tạo Node-Cron job cho báo cáo hàng tuần.');
};

module.exports = {
    initCronJobs,
    generateAndSendReport // Export để test thủ công nếu cần
};
