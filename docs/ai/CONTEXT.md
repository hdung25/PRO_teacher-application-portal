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

### ⚠️ Trạng thái thực tế (Demo Mode)

Các chức năng sau hiện **chỉ là giả lập (mock/demo)**, chưa tích hợp thật:

| Chức năng | Hiện tại | Cần làm |
|-----------|---------|---------|
| Camera preview | Static placeholder | WebRTC `getUserMedia()` |
| Mic level (DB LEVEL) | Random number 15–55 | Web Audio API `AnalyserNode` |
| Email confirmation | Nút "Continue" bỏ qua | Backend API gửi email + verify |
| Form submission | Chỉ validate local | Backend API lưu data |
| Video recording | Giả lập start/stop | `MediaRecorder` API + upload |
| Data storage | Không có | Backend + Database |

### 🐛 Known Bugs
- Không có bug được phát hiện tại thời điểm này.

### 📋 Tasks tiếp theo (Backlog)

| Priority | Task | Mô tả |
|----------|------|-------|
| **High** | WebRTC integration | Camera/mic thực cho recording pages |
| **High** | Real mic level | Web Audio API thay vì random number |
| **High** | Backend API + Database | Lưu form data, recordings |
| **High** | Email confirmation flow | Gửi email + verify link |
| Medium | Video upload | Upload recording lên cloud storage |
| Medium | Admin dashboard | Review ứng viên |
| Low | i18n | Hỗ trợ tiếng Việt |
| Low | Unit tests | Vitest + RTL |
| Low | Animation polish | Page transitions, micro-interactions |

### 🔧 Dev Environment
- **Dev server**: `npm run dev` → `http://localhost:3000/`
- **Node**: 18+
- **Package manager**: npm
