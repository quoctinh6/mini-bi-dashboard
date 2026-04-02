const nodemailer = require('nodemailer');

const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email.' });
    }

    // Config for SMTP or fallback to Ethereal/console for testing
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    let transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort == 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } else {
      // For testing without .env config: we create a fake test account
      console.log('Chưa cấu hình SMTP_USER và SMTP_PASS, sử dụng Ethereal Email mặc định...');
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    // Gửi báo cáo mẫu
    const info = await transporter.sendMail({
      from: `"Mini BI Dashboard" <${smtpUser || 'no-reply@ethereal.email'}>`,
      to: email,
      subject: "Báo cáo Kiểm tra Hệ thống BI Dashboard",
      text: "Đây là email xác nhận cấu hình gửi báo cáo đã hoạt động thành công.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
          <div style="max-w-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; border-top: 4px solid #d946ef;">
            <h1 style="color: #111827; font-size: 24px;">Xác nhận Cấu hình Email Thành công!</h1>
            <p style="color: #4b5563; line-height: 1.6;">Xin chào,</p>
            <p style="color: #4b5563; line-height: 1.6;">Hệ thống Kernel404 BI Dashboard đã gửi báo cáo kiểm tra này đến bạn. Điều này xác nhận rằng hệ thống gửi Mail (SMTP) đã được thiết lập đúng.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #fdf4ff; border-radius: 6px; border-left: 4px solid #d946ef;">
              <p style="margin: 0; color: #86198f; font-weight: bold;">Tóm tắt nhanh:</p>
              <ul style="color: #a21caf; margin-top: 10px;">
                <li>Doanh thu ngày hôm nay: <strong>Chờ cấu hình...</strong></li>
                <li>Hệ thống server: <strong>Healthy</strong></li>
                <li>Module gửi Email: <strong>OK</strong></li>
              </ul>
            </div>
            
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 30px;">
              Email này được tạo tự động từ hệ thống. Vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    
    // Nếu dùng Ethereal, trả về preview URL luôn cho frontend hoặc logs
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
      return res.json({ 
        success: true, 
        message: 'Gửi Test thành công qua Ethereal Email. Hãy kiểm tra Preview URL ở giao diện Console (nếu chạy local).',
        previewUrl 
      });
    }

    res.json({ success: true, message: 'Email kiểm tra đã được gửi thành công.' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: 'Lỗi cấu hình SMTP hoặc server không gửi được mail: ' + error.message });
  }
};

module.exports = {
  sendTestEmail
};
