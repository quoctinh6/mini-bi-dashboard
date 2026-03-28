13. Hệ thống Dashboard & Báo cáo Tổng hợp Doanh nghiệp
1. Nguồn dữ liệu (Data Source)

Yêu cầu Cơ bản:

Nhập liệu thủ công qua form hoặc Import từ file Excel/CSV.

Hiển thị danh sách dữ liệu thô (Raw data) dạng bảng.

Mở rộng & Nâng cao:

ETL Lite: Tự động làm sạch dữ liệu khi import (Xử lý ô trống, chuẩn hóa định dạng ngày tháng).

Kết nối API: Lấy dữ liệu tự động từ một hệ thống khác (giả lập) thay vì upload file.

2. Trực quan hóa (Visualization)

Yêu cầu Cơ bản:

Có ít nhất 4 loại biểu đồ: Cột (Bar), Đường (Line), Tròn (Pie), và Thẻ số (Metric Card).

Biểu đồ có chú thích (Legend) và tiêu đề rõ ràng.

Mở rộng & Nâng cao:

Biểu đồ kết hợp (Mixed Chart): Cột và Đường trên cùng một biểu đồ.

Bản đồ (Geo Chart): Thống kê dữ liệu theo tỉnh thành/vùng miền trên bản đồ Việt Nam.

Tùy biến: Cho phép đổi màu sắc biểu đồ.

3. Bộ lọc dữ liệu (Filtering)

Yêu cầu Cơ bản:

Lọc theo khoảng thời gian (Từ ngày - Đến ngày).

Lọc theo một tiêu chí cố định (Ví dụ: Lọc theo Phòng ban).

Mở rộng & Nâng cao:

Bộ lọc tương tác (Global Filter): Chọn một tiêu chí ở trên đầu trang, tất cả biểu đồ bên dưới tự động nhảy số theo.

Lọc chéo: Click vào 1 vùng trên biểu đồ Tròn -> Biểu đồ Cột bên cạnh tự động lọc theo vùng đó.

4. Phân tích sâu (Drill-down)

Yêu cầu Cơ bản:

Xem báo cáo ở mức tổng quát.

Mở rộng & Nâng cao:

Drill-down: Click vào cột "Năm 2023" -> Biểu đồ chuyển sang hiển thị chi tiết theo 12 tháng của năm đó.

View Details: Click vào biểu đồ hiện ra danh sách các bản ghi cấu thành nên con số đó.

5. Chỉ số thông minh (Smart Metrics)

Yêu cầu Cơ bản:

Tính tổng (Sum) và Đếm (Count) cơ bản.

Mở rộng & Nâng cao:

So sánh kỳ (Growth rate): Tự động tính % tăng trưởng so với tháng trước.

Tỷ trọng: Tự động tính % đóng góp của từng hạng mục vào tổng thể.

6. Dashboard Cá nhân hóa

Yêu cầu Cơ bản:

Một trang dashboard cố định cho tất cả mọi người.

Mở rộng & Nâng cao:

Kéo thả Widget: Cho phép người dùng tự chọn biểu đồ nào hiện lên trước, biểu đồ nào hiện sau.

Lưu Template: Lưu lại các bộ lọc yêu thích để lần sau vào là thấy ngay.

7. Chia sẻ & Xuất bản (Export)

Yêu cầu Cơ bản:

Xem trực tuyến trên trình duyệt.

Mở rộng & Nâng cao:

Xuất báo cáo: Xuất trang Dashboard ra file PDF hoặc ảnh (Image) để gửi báo cáo nhanh qua Zalo/Email.

Lịch gửi báo cáo: Tự động gửi email ảnh chụp Dashboard vào 8h sáng thứ Hai hàng tuần.

8. Cảnh báo (Alerting)

Yêu cầu Cơ bản:

Không yêu cầu.

Mở rộng & Nâng cao:

Ngưỡng cảnh báo: Nếu Doanh thu < 50% kế hoạch, thẻ số sẽ đổi sang màu Đỏ và hiện biểu tượng cảnh báo.

Thông báo: Gửi Noti khi có một chỉ số biến động bất thường.

9. Phân quyền dữ liệu (Data Security)

Yêu cầu Cơ bản:

Đăng nhập mới xem được báo cáo.

Mở rộng & Nâng cao:

Row-level Security: Cùng một Dashboard nhưng Trưởng phòng miền Bắc chỉ thấy số liệu miền Bắc, Giám đốc thấy toàn quốc.

10. Hiệu năng xử lý

Yêu cầu Cơ bản:

Chạy được với 100 dòng dữ liệu.

Mở rộng & Nâng cao:

Xử lý dữ liệu lớn: Hệ thống vẫn mượt mà khi xử lý 10.000 - 50.000 dòng dữ liệu (Tính toán ở Backend thay vì tải hết về Frontend).