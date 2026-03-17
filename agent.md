# Hệ Thống Quản Lý Trợ Lý AI (Agent Knowledge Base)

## 📌 Tổng Quan Dự Án (Project Overview)
**Tên dự án:** Mini BI Dashboard
**Kiến trúc:** Cấu trúc Monorepo bao gồm tách riêng biệt `frontend` và `backend`.

### 1. Frontend (Storybook Only)
- **Framework:** Storybook (Giao diện UI được phát triển độc lập, quản lý component qua Storybook, toàn bộ Next.js App Router đã bị loại bỏ theo yêu cầu của dự án)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS, PostCSS.
- **Thư viện chính:**
  - `echarts`, `echarts-for-react`: Vẽ biểu đồ động (Dashboard BI).
  - `react-grid-layout`: Kéo thả và thay đổi kích thước layout dashboard.
  - `html2canvas`, `jspdf`: Xuất báo cáo, biểu đồ ra file PDF.
  - `axios`: Gọi API.
  - `lucide-react`: Hệ thống icon.

### 2. Backend (Node.js & Express)
- **Framework:** Node.js, Express
- **Cơ sở dữ liệu:** MySQL (thông qua Prisma ORM)
- **Cấu trúc Backend chính:**
  - `controllers/`, `routes/`, `middlewares/`, `utils/`, `cron/`.
  - **Routes hiện tại đang có:** 
    - `analyticsRoutes.js` (Phân tích dữ liệu)
    - `manualEntryRoutes.js` (Nhập dữ liệu thủ công / Data Entry)
    - `uploadRoutes.js` (Upload file / Xử lý Excel với `multer` & `xlsx`)
- **Thư viện chính Backend:**
  - `@prisma/client`: Quản lý Database.
  - `jsonwebtoken`: Xác thực người dùng (Auth).
  - `puppeteer`: Có thể dùng cho render báo cáo tự động / crawler.
  - `node-cron`: Lên lịch tác vụ tự động (Automated Tasks).
  - `nodemailer`: Gắn module gửi email.

### 3. Database Schema (Prisma)
Các model chính hiện tại đang có trong hệ thống (`backend/prisma/schema.prisma`):
- `User`: Lưu thông tin người dùng (`id`, `role`, `zone`).
- `dashboard_1`: Lưu dữ liệu doanh số/báo cáo (`Order_ID`, `Order_Date`, `Department`, `Revenue`, `Province`, `Zone`).
- `DashboardConfig`: Lưu cấu hình bố cục giao diện của từng User (`id`, `userId`, `layoutConfig`).

---

## 🛑 Quy định tự động cập nhật (Auto-update Protocol)
1. Mỗi khi User yêu cầu cài đặt thêm một thư viện (npm install), tạo thêm một bảng mới trong Prisma Schema, hoặc thay đổi cấu trúc thư mục cốt lõi.
2. AI bắt buộc phải tự động đề xuất: "Tôi nhận thấy có thay đổi lớn, tôi sẽ tự động cập nhật lại file `agent.md` để lưu lại kiến thức này nhé?".
3. Nếu User đồng ý, AI phải tự động ghi đè thông tin mới vào file `agent.md` này ngay lập tức để không bị quên trong tương lai.
