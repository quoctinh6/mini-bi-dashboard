# Danh sách các Biểu đồ (Charts) Cần Thiết

Dựa trên tài liệu `yêu cầu đề bài.md` của dự án "Hệ thống Dashboard & Báo cáo Tổng hợp Doanh nghiệp", dưới đây là danh sách phân tích các loại biểu đồ và tính năng trực quan hóa dữ liệu (Visualization) mà hệ thống cần phải xây dựng:

## 1. Các Biểu đồ Thống kê Cơ bản (Core Charts)
- **Thẻ KPI / Thẻ Số (Metric Card)**
  - *Mục đích*: Hiển thị trực tiếp các con số tổng quan, quan trọng nhất (VD: Tổng doanh thu, Tổng đơn hàng, Lợi nhuận).
  - *Chỉ số thông minh*: Tự động hiển thị % tăng trưởng/sụt giảm so với kỳ trước (Growth rate).
  - *Cảnh báo (Alert)*: Có khả năng tự động đổi sang trạng thái cảnh báo (đỏ) nếu chỉ số rơi xuống dưới ngưỡng quy định (VD: Doanh thu < 50% kế hoạch).

- **Biểu đồ Cột (Bar Chart)**
  - *Mục đích*: Thể hiện sự so sánh về độ lớn giữa nhiều đối tượng. 
  - *Ví dụ*: Đối chiếu doanh thu theo chi nhánh, so sánh chi phí của các phòng ban.

- **Biểu đồ Đường (Line Chart)**
  - *Mục đích*: Trực quan hóa xu hướng tăng/giảm của dữ liệu qua một quá trình thời gian liên tục.
  - *Ví dụ*: Xu hướng lượt truy cập app theo giờ, biến động chi phí logistic các quý.

- **Biểu đồ Tròn / Bánh (Pie Chart / Donut Chart)**
  - *Mục đích*: Hiển thị quy mô cấu trúc, tỷ trọng (tính theo phần trăm) đóng góp của các phần tử vào tổng thể.
  - *Ví dụ*: Tỷ trọng ngành hàng (Thiết bị, Phần mềm, Dịch vụ).

## 2. Các Biểu đồ Chuyên sâu & Nâng cao (Advanced Charts)
- **Biểu đồ Kết hợp (Mixed Chart: Bar + Line)**
  - *Mục đích*: Trồng 2 loại biểu đồ (Cột và Đường) lên cùng một mặt phẳng với trục X chung (thường là thời gian) và có thể có 2 trục Y để so sánh sự tương quan.
  - *Ví dụ phổ biến nhất*: Biểu đồ cột hiển thị mức thu "Thực tế", đường vẽ cắt ngang hiển thị mức thu "Kế hoạch".

- **Biểu đồ Không gian / Bản đồ (Geo Chart)**
  - *Mục đích*: Sắp xếp số liệu dựa trên yếu tố địa lý của bản đồ Việt Nam hoặc Thế giới.
  - *Ví dụ*: Thống kê đại lý theo tỉnh thành (tô màu đổ bóng vùng nào doanh thu cao thì màu đậm hơn).

## 3. Các tính năng tương tác với Biểu đồ (Interactions)
Các biểu đồ trên không chỉ hiển thị tĩnh mà còn cần đính kèm các thao tác cho người dùng:
- **Phân tích sâu (Drill-down)**: Chọn vào dữ liệu ở mức vĩ mô (click vào Cột Năm 2023) thì biểu đồ chạy hiệu ứng trượt/nở ra xem dữ liệu vi mô (12 tháng của năm 2023).
- **Lọc chéo (Cross-filtering)**: Nhấn vào 1 góc "Miền Bắc" ở biểu đồ tròn, thì ngay lập tức biểu đồ cột doanh thu bên cạnh sẽ chỉ hiện thị doanh thu riêng của Miền Bắc.
- **Xem chi tiết (View Details)**: Cho phép click vào biểu đồ (ví dụ thẻ doanh thu) để mở Popup chứa bảng Grid (Dataset) các record cấu thành nên tính toán đó.
- **Global Data Binding**: Mọi biểu đồ trên Layout sẽ phản hồi (thay đổi số liệu) lập tức khi người dùng chọn lọc ở bộ lọc gốc (Bộ lọc thời gian chung).
- **Tùy chọn hiển thị**: Người dùng xem biểu đồ có quyền kéo thả kích cỡ, tùy chọn thay đổi màu sắc của hệ màu biểu đồ theo cá nhân hóa, hoặc xuất ảnh (Export Image/PDF) của biểu đồ đó.


1 ô là 125px x 100px

1 hàng là 8 ô

