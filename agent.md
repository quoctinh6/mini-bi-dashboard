# Hệ Thống Quản Lý Trợ Lý AI (Agent Knowledge Base)

## 📌 Tổng Quan Dự Án (Project Overview)
**Tên dự án:** Mini BI Dashboard (Kernel404)
**Kiến trúc:** Cấu trúc Monorepo chia tách `frontend` và `backend`.
**Mục tiêu:** Cung cấp dashboard phân tích dữ liệu kinh doanh thời gian thực với phân quyền theo vùng miền (RLS).

---

## 🏗️ 1. Frontend Architecture
- **Framework:** Storybook & Next.js 14 (Base).
- **Ngôn ngữ:** TypeScript.
- **UI & Charts:**
  - `echarts`, `echarts-for-react`: Biểu đồ Dashboard (Donut, Mixed, Geo).
  - `react-grid-layout`: Kéo thả tùy chỉnh giao diện Dashboard.
- **Service Layer:** `frontend/services/apiService.ts` (Sử dụng Axios + Bearer Token).

---

## ⚙️ 2. Backend Architecture (Node.js & Express)
- **Framework:** Node.js, Express.
- **ORM:** Prisma v5.
- **Cấu trúc thư mục:**
  - `controllers/`: Xử lý logic nghiệp vụ.
  - `routes/`: Định nghĩa các endpoint API.
  - `services/`: Chứa các logic tính toán nặng (Aggregation) và RLS.
  - `middlewares/`: Xác thực JWT và phân quyền.
  - `cron/`: Tác vụ tự động (Báo cáo, Ingestion).

---

## 🔐 3. Authentication & RLS (Bảo mật)
- **Auth:** Sử dụng JWT. Secret key lưu trong `.env` (`JWT_SECRET`).
- **Phân quyền (RLS):**
  - **ADMIN / DIRECTOR**: Toàn quyền xem dữ liệu cả nước.
  - **MANAGER / EMPLOYEE**: Chỉ xem được dữ liệu trong các Tỉnh/Vùng được gán trong bảng `user_region_access`.
- **Dữ liệu đăng nhập mặc định (Seed):**
  - `admin` / `admin123` (ADMIN)
  - `giamdoc` / `director123` (DIRECTOR)
  - `truongphong_bac` / `manager123` (Chỉ xem Miền Bắc)

---

## 📊 4. Database Schema (Prisma)
Chi tiết các bảng quan trọng (`backend/prisma/schema.prisma`):
- **User & Auth**: `users`, `roles`, `user_region_access`.
- **Master Data**: `regions`, `provinces` (34 tỉnh), `categories`, `departments`.
- **Business Data**:
  - `kernel404_transactions` (Model: `Kernel404`): Lưu giao dịch chính.
  - `targets`: Lưu chỉ tiêu doanh thu theo tháng/năm/vùng.
- **System**: `notifications`, `dashboard_settings`.

---

## 🚀 5. API Reference (End-points)

### Auth API (`/api/auth`)
- `POST /login`: Đăng nhập lấy JWT Token.

### Master Data API (`/api/master`)
- `GET /provinces`: Lấy danh sách 34 tỉnh/thành.
- `GET /categories`: Lấy danh sách ngành hàng.
- `GET /departments`, `GET /regions`.

### Dashboard & Analytics (`/api/dashboard`, `/api/analytics`)
- `GET /overview`: Lấy toàn bộ KPI + dữ liệu biểu đồ đã aggregated (RLS applied).
- `GET /metrics`: Lấy nhanh các chỉ số KPI.
- `GET /sales`: Lấy dữ liệu biểu đồ chi tiết (groupBy: Date/Province/Category).

### Data Ingestion (`/api/data`)
- `POST /manual`: Nhập liệu thủ công (Yêu cầu IDs).
- `POST /upload`: Import dữ liệu từ Excel/CSV (Hỗ trợ auto-mapping tên sang ID).

---

## 🛠️ 6. Workflow & Seeding
- **Main Seed:** `node prisma/seed.js` (Tạo master data + 50k giao dịch).
- **Dev Seed (Small):** `node prisma/seed_transactions_100.js` (Reset và tạo chính xác 100 dòng cho dev).

---

## 🛑 Quy định tự động cập nhật (Auto-update Protocol)
1. Khi có thay đổi về **Schema Prisma**, **Route API mới**, hoặc **Logic RLS**.
2. AI phải đề xuất cập nhật file `agent.md` này để đồng bộ hóa kiến thức.
3. Luôn đảm bảo `agent.md` là "Source of Truth" để các lượt làm việc sau không cần đi tìm file lẻ.
