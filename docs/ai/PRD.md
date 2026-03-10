# PRD — Product Requirements Document
## 123 ENGLISH Teacher Application Portal

### 1. Mục tiêu dự án
Xây dựng một luồng **Onboarding & Kiểm tra năng lực giáo viên** cho nền tảng giáo dục trực tuyến **123 ENGLISH**, lấy cảm hứng từ Engoo. Hệ thống giúp ứng viên giáo viên đăng ký, xác nhận email, và hoàn thành bài kiểm tra năng lực (video + ngôn ngữ) một cách trực quan, thân thiện.

### 2. Đối tượng người dùng
| Vai trò | Mô tả |
|---------|-------|
| **Ứng viên giáo viên** | Người muốn đăng ký dạy trên 123 ENGLISH. Đa quốc tịch, độ tuổi 20–55, sử dụng laptop/PC. |
| **Admin (tương lai)** | Quản trị viên review kết quả test. *(Chưa nằm trong scope hiện tại)* |

### 3. Phạm vi dự án (Scope)

#### Trong phạm vi (v1.0)
- Stepper navigation 5 bước: Registration → Video Test → Language → Demo Teaching → Done!
- Step-locking: không cho click vào bước chưa hoàn thành.
- **Step 1 — Application Form**: Form đăng ký với Country, Nationality, Name, Email, Password.
- **Step 2 — Email Confirmation** *(placeholder — chỉ có nút Continue)*
- **Step 3 — Language Test Recording**: Hiển thị câu hỏi, camera preview, countdown, nút ghi hình.
- **Step 4 — Demo Teaching**: Ghi hình bài giảng demo 3–5 phút, camera preview, tips.
- **Step 5 — Done!**: Thông báo hoàn thành.

#### Ngoài phạm vi
- Backend API / database.
- Tích hợp camera thực (WebRTC).
- Admin dashboard.
- Đa ngôn ngữ (i18n).
- Authentication flow thực.

### 4. User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| US-01 | Ứng viên | Điền form đăng ký với thông tin cá nhân | Tôi có thể tạo tài khoản |
| US-02 | Ứng viên | Thấy validation lỗi rõ ràng khi điền thiếu | Tôi biết cần sửa gì |
| US-03 | Ứng viên | Ẩn/hiện mật khẩu khi nhập | Tôi kiểm tra được mật khẩu đã gõ |
| US-04 | Ứng viên | Xem thanh tiến trình (stepper) | Tôi biết mình đang ở bước nào |
| US-05 | Ứng viên | Xem câu hỏi tiếng Anh và chuẩn bị ghi hình | Tôi hoàn thành bài test ngôn ngữ |
| US-06 | Ứng viên | Thấy đếm ngược trước khi ghi hình | Tôi có thời gian chuẩn bị |
| US-07 | Ứng viên | Xem trạng thái microphone | Tôi biết mic đang hoạt động |
| US-08 | Ứng viên | Ghi hình bài giảng demo 3–5 phút | Tôi thể hiện được phong cách giảng dạy |
| US-09 | Ứng viên | Không thể bỏ qua bước chưa hoàn thành | Tôi hoàn thành đúng trình tự |

### 5. Yêu cầu phi chức năng
- **Responsive**: Hoạt động tốt trên mobile (≥375px) và desktop.
- **Performance**: FCP < 1.5s (Vite + code-splitting).
- **Accessibility**: Có `aria-label`, focus ring, semantic HTML.
- **Browser support**: Chrome, Edge, Firefox (latest 2 versions).
