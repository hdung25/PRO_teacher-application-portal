# CONTEXT — Current State & Progress
## 123 ENGLISH Teacher Application Portal

> **Cập nhật lần cuối**: 2026-03-10

### ✅ Đã hoàn thành

| Task | Trạng thái | Ghi chú |
|------|-----------|---------|
| Khởi tạo project (Vite + React) | ✅ Done | `package.json`, configs |
| Cấu hình Tailwind CSS v3 | ✅ Done | Custom palette, animations, shadow tokens |
| Header component | ✅ Done | 123 ENGLISH branding, sticky |
| Stepper component | ✅ Done | 5 steps, animated progress line, step-locking (lock icon cho future steps) |
| App layout + step routing | ✅ Done | Switch/case cho 5 steps, `completedSteps` state |
| **Step 1: Application Form** | ✅ Done | 7 fields, validation, password toggle, terms checkbox |
| **Step 2: Email Confirmation** | ✅ Done | Placeholder — chỉ có nút Continue |
| **Step 3: Language Test Recording** | ✅ Done | Question card, camera preview (giả lập), countdown, mic level (giả lập), start/stop |
| **Step 4: Demo Teaching** | ✅ Done | Camera preview (giả lập), countdown, recording timer (3–5 min target), tips |
| **Step 5: Done Screen** | ✅ Done | Thông báo hoàn thành |
| Step-locking logic | ✅ Done | Không cho click vào step chưa hoàn thành |
| Docs: PRD, ARCHITECTURE, CONVENTIONS | ✅ Done | |

### ⚠️ Trạng thái thực tế (Real Mode)

Tất cả các chức năng demo đã được chuyển sang **chạy thực tế (Production-ready)** với Supabase:

| Chức năng | Implement | Ghi chú |
|-----------|-----------|---------|
| Database | Supabase PostgreSQL | Bảng `teachers` với Row Level Security (RLS) |
| Form submission | Supabase Auth + DB | Đăng ký Auth `signUp` và insert profile |
| Email confirmation | Supabase Auth | Gửi email thực tế, verify link chặn tại Bước 2 |
| Camera preview | WebRTC `getUserMedia` | Hook `useCamera` báo lỗi nếu denied/not found |
| Mic level | Web Audio API `AnalyserNode` | Hook `useMicrophone` đo âm lượng thực (RMS 0-100) |
| Video recording | `MediaRecorder` API | Hook `useRecorder` quay video/webm |
| Video upload | Supabase Storage | Bucket `recordings`, upload với progress state |

### 🐛 Known Bugs
- Không có bug được phát hiện tại thời điểm này.

### 📋 Tasks tiếp theo (Backlog)

| Priority | Task | Mô tả |
|----------|------|-------|
| Medium | Admin dashboard | Giao diện cho Admin review ứng viên (xem video, duyệt) |
| Low | i18n | Hỗ trợ đa ngôn ngữ (Tiếng Anh/Tiếng Việt) |
| Low | Unit tests | Setup Vitest + React Testing Library |
| Low | Animation polish | Thêm page transitions mượt mà hơn giữa các step |

### 🔧 Dev Environment
- **Dev server**: `npm run dev` → `http://localhost:3000/` (Phải dùng `localhost` để test camera/mic trên máy tính, hoặc dùng `--host` và truy cập qua IP nếu có HTTPS hoặc config trình duyệt cho phép insecure origin).
- **Node**: 18+
- **Backend**: Supabase (Auth, DB, Storage)
