# CONTEXT — Current State & Progress
## 123 ENGLISH Teacher Application Portal

> **Cập nhật lần cuối**: 2026-03-10

### ✅ Đã hoàn thành

| Task | Trạng thái | Ghi chú |
|------|-----------|---------|
| Khởi tạo project (Vite + React) | ✅ Done | `package.json`, configs |
| Cấu hình Tailwind CSS v3 | ✅ Done | Custom palette, animations, shadow tokens |
| Header component | ✅ Done | 123 ENGLISH branding, sticky |
| Stepper component | ✅ Done | 4 steps, animated progress line, clickable |
| App layout + step routing | ✅ Done | Switch/case cho 4 steps |
| **Page 1: Application Form** | ✅ Done | 7 fields, validation, password toggle, terms checkbox |
| **Page 6: Language Test Recording** | ✅ Done | Question card, camera preview, countdown, mic level, start/stop |
| Placeholder pages (step 2, 4) | ✅ Done | Basic UI |
| Docs: PRD, ARCHITECTURE, CONVENTIONS | ✅ Done | |

### 🐛 Known Bugs
- Không có bug được phát hiện tại thời điểm này.

### 📋 Tasks tiếp theo (Backlog)

| Priority | Task | Mô tả |
|----------|------|-------|
| High | Page 2: Email Confirmation | Mascot illustration, resend email link |
| High | Page 3: Pre-Test Instructions | Registration complete, Chrome/wired internet reminder |
| High | Page 4: Environment/Video Test | Browser video capability check |
| High | Page 5: Hardware Permission | Camera/mic permission, video preview |
| Medium | WebRTC integration | Camera/mic thực cho pages 5, 6 |
| Medium | Backend API | Register endpoint, test submission |
| Low | i18n | Hỗ trợ tiếng Việt |
| Low | Unit tests | Vitest + RTL |
| Low | Animation polish | Page transitions, micro-interactions |

### 🔧 Dev Environment
- **Dev server**: `npm run dev` → `http://localhost:3000/`
- **Node**: 18+
- **Package manager**: npm
