# Mini BI Dashboard

## Giới thiệu (Introduction)
Mini BI Dashboard là một ứng dụng phân tích dữ liệu tổng hợp (Business Intelligence) toàn diện được xây dựng với kiến trúc Client-Server hiện đại. Ứng dụng giúp người dùng theo dõi các chỉ số quan trọng, trực quan hóa dữ liệu qua các biểu đồ đa dạng và tự động tạo báo cáo chuyên nghiệp.

## Kiến trúc & Công nghệ (Tech Stack)

### 1. Frontend (Giao diện người dùng)
- **Framework:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Libraries & Công cụ:**
  - **ECharts (`echarts`, `echarts-for-react`):** Vẽ các biểu đồ tương tác phức tạp (MixedChart, PieChart, GeoChart).
  - **`react-grid-layout` & `react-resizable`:** Hệ thống lưới động cho phép kéo thả, thay đổi kích thước và tùy chỉnh vị trí các widget (Metric Cards, Charts) trên dashboard theo ý muốn của người dùng.
  - **`html2canvas` & `jsPDF`:** Hỗ trợ tính năng chụp ảnh dashboard và xuất trực tiếp thành file PDF trên trình duyệt.
  - **`axios`:** Tương tác với hệ thống API backend.
  - **`lucide-react`:** Cung cấp hệ thống biểu tượng (icons) hiện đại.

### 2. Backend (Máy chủ xử lý)
- **Framework:** Node.js, Express.js
- **Database & ORM:** MySQL kết hợp với Prisma Client để quản lý và truy vấn cơ sở dữ liệu (các model như `User`, `Kernel404` (lưu giao dịch), `Target`, `DashboardSetting`).
- **Xác thực (Authentication):** Sử dụng JSON Web Token (`jsonwebtoken`) cho bảo mật API.
- **Xử lý tệp (File Handling & Data Ingestion):**
  - **`multer`:** Middleware xử lý tải lên tệp tin (Excel/CSV) từ phía người dùng.
  - **`xlsx` (SheetJS):** Thư viện cốt lõi để đọc dữ liệu từ tệp Excel tải lên và **tạo/xuất tệp Excel (.xlsx)** từ máy chủ.
  - **Server-Side Streaming/Buffer:** Kỹ thuật xuất dữ liệu quy mô lớn (hàng chục ngàn dòng) trực tiếp từ bộ nhớ đệm máy chủ, giúp tối ưu hiệu năng và tránh treo trình duyệt.
- **Tự động hóa (Automation & Cron Jobs):** 
  - `node-cron`: Đặt lịch các tác vụ chạy ngầm định kỳ (Báo cáo, Ingestion).
  - `puppeteer`: Render và xuất HTML thành tài liệu PDF/Screen Capture trên backend ngầm để gửi báo cáo tự động.
- **Gửi Mail:** `nodemailer` để tự động gửi báo cáo xuất ra từ Puppeteer định kỳ.

## Chức năng chính (Features)

### 📊 Trực quan hóa Dữ liệu (Data Visualization)
- **Metrics Cards (Thẻ chỉ số):** Hiển thị các chỉ số sống còn như *Tổng doanh thu, Đơn hàng mới, Khách hàng kích hoạt, Lợi nhuận ròng* kèm theo màu sắc biểu thị tăng/giảm so với mục tiêu.
- **Mixed Chart:** Biểu đồ kết hợp (Cột + Đường) phân tích thay đổi doanh thu qua các mốc thời gian.
- **Pie Chart:** Phân bổ tỷ trọng doanh số giữa các Phòng ban (Department).
- **Geo Chart:** Bản đồ nhiệt (Heatmap) thể hiện tổng quan kinh doanh theo Tỉnh/vùng miền (Province/Zone).

### 🔍 Lọc Dữ liệu Động & Cross-Filtering
- **Global Filters:** Lọc dữ liệu trên toàn bộ Dashboard theo các trường như *Ngày tháng (startDate, endDate), Khu vực, Ngành hàng*.
- **Tương tác Cross-Filtering:** Khi người dùng click (Drill-down) vào một biểu đồ, các widget khác sẽ tự động điều chỉnh hiển thị tương ứng.

### 🎨 Tùy biến Giao diện (Customizable Layout)
- Người dùng có thể kéo thả, thay đổi kích thước các widget.
- Lưu trữ cấu trúc Layout (Layout Config) theo từng tài khoản người dùng (`DashboardSetting`).

### 🖨️ Xuất Báo cáo & Dữ liệu (Export & Reporting)
- **Xuất Excel thông minh:** Cho phép người dùng tải về toàn bộ dữ liệu đã lọc (không bị giới hạn bởi phân trang) dưới dạng tệp `.xlsx` có định dạng chuẩn, hỗ trợ tiếng Việt hoàn hảo.
- **Xuất PDF thủ công:** Chụp ảnh Dashboard hiện tại và xuất thành file PDF chất lượng cao ngay trên trình duyệt.
- **Báo cáo định kỳ (Cron Jobs):** Tự động gửi báo cáo Dashboard qua Email hàng ngày/tuần.

### 📥 Nhập và Quản lý Dữ liệu
- **Tải lên hàng loạt (Bulk Upload):** Nhập hàng ngàn giao dịch từ file Excel vào hệ thống chỉ trong vài giây.
- **Nhập thủ công (Manual Entry):** Giao diện thân thiện để thêm/sửa từng bản ghi giao dịch đơn lẻ.
- **Đồng bộ API ERP:** Tích hợp cơ chế giả lập đồng bộ dữ liệu từ các hệ thống ERP bên ngoài.

### 🔒 Bảo mật Row-Level Security (RLS)
- Hệ thống tự động lọc dữ liệu dựa trên quyền hạn của người dùng đăng nhập. 
- *Ví dụ:* Quản lý Miền Bắc chỉ nhìn thấy và xuất được dữ liệu của Miền Bắc, trong khi Giám đốc (Director) có thể xem toàn quốc.

## 🚀 DevOps & Triển khai (Deployment)

Dự án được tối ưu hóa cho containerization bằng Docker, hỗ trợ cả môi trường phát triển (Development) và vận hành thực tế (Production).

### 1. Phát triển local với Docker (Development)
Sử dụng cấu hình này để có môi trường ổn định, hỗ trợ **Hot Reload** (code thay đổi trong máy của bạn sẽ được cập nhật ngay lập tức vào container).

#### 🪟 Cho Windows (Sử dụng Docker Desktop)
*   **Yêu cầu:** Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/). Nên bật **WSL 2 backend** để đạt hiệu năng tốt nhất.
*   **Cách chạy:** Mở PowerShell hoặc Terminal tại thư mục gốc và chạy:
    ```powershell
    docker compose up --build
    ```

#### 🐧 Cho Linux (Ubuntu/Debian/Fedora)
*   **Yêu cầu:** Đã cài đặt [Docker Engine](https://docs.docker.com/engine/install/) và [Docker Compose Plugin](https://docs.docker.com/compose/install/).
*   **Lưu ý:** Nếu chưa cấu hình [Post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/), bạn cần thêm `sudo` trước các lệnh.
*   **Cách chạy:**
    ```bash
    docker compose up --build
    ```
*   **Sau khi chạy:**
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:5000`
    -   DB MySQL: `localhost:3307` (User: `root`, Pass: `rootpassword`)
*   **Lưu ý:** Hệ thống đã tích hợp `healthcheck` để đảm bảo Backend chỉ khởi động sau khi Database đã sẵn sàng kết nối.

### 2. Triển khai Production (Docker Compose)
Dành cho việc chạy thử nghiệm trong môi trường giống thực tế hoặc triển khai lên máy chủ. Cấu hình này giới hạn tài nguyên (RAM/CPU) và tối ưu hóa ảnh Docker.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
*   **Cổng mặc định:** Frontend sẽ chạy trực tiếp ở cổng `80`.

### 3. Giải thích các tệp Docker (Docker File Components)

*   **`docker-compose.yml` (Dev):** 
    -   Ánh xạ thư mục local vào container (`Volumes`) để hot-reload.
    -   Giữ môi trường development nhất quán cho toàn đội ngũ.
*   **`docker-compose.prod.yml` (Prod):** 
    -   Giới hạn tài nguyên (RAM limit: 256MB/service) để ổn định server.
    -   Sử dụng multi-stage build để giảm dung lượng ảnh.
*   **`backend/Dockerfile`:** 
    -   Dựa trên `node:18-alpine`.
    -   Tự động chạy `npx prisma generate` để tạo Prisma Client trong container.
*   **`frontend/dockerfile`:**
    -   Sử dụng cơ chế `standalone` của Next.js (giảm từ 1GB xuống còn ~150MB).
    -   Chia làm 3 giai đoạn: `deps` (cài thư viện), `builder` (biên dịch), `runner` (chạy app).

---

## ☁️ Hướng dẫn triển khai lên VPS (VPS Deployment Guide)

Để đưa dự án lên một VPS (Ubuntu/Debian), hãy làm theo các bước sau:

### Bước 1: Cài đặt Docker trên VPS
Chạy lệnh sau để cài đặt Docker & Docker Compose:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Bước 2: Chuẩn bị mã nguồn & Cấu hình
1. Clone dự án: `git clone <your-repo-url>`
2. Di chuyển vào thư mục dự án: `cd mini-bi-dashboard`
3. Cấu hình biến môi trường:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env
   ```
   *(Cập nhật `DATABASE_URL` và `JWT_SECRET` của bạn)*

### Bước 3: Khởi chạy Production
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Bước 4: Cấu hình Nginx (Tùy chọn - Reverse Proxy)
Để sử dụng tên miền (domain.com), bạn nên cài Nginx và cấu hình vhost:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80; # Trỏ về cổng frontend của docker-prod
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Bước 5: Cài đặt SSL (Certbot)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🛠️ Các lệnh hữu ích (Useful Commands)

- **Database Migration:** `docker exec -it kernel404_backend npx prisma db push`
- **Seed Data:** `docker exec -it kernel404_backend npx prisma db seed`
    -   *Lưu ý: Script seed này tạo ra ~50,000 dòng dữ liệu mẫu để test hiệu năng. Nếu không cần, bạn có thể bỏ qua lệnh này hoặc xóa dòng `npx prisma db seed` trong `docker-compose.yml`.*
- **Xem logs:** `docker compose logs -f`
- **Dừng hệ thống:** `docker compose down`

---
## cách chạy API erp 

```bash
cd  api erp
npm install
npx json-server --watch db.json --port 5050 --host 0.0.0.0
```

