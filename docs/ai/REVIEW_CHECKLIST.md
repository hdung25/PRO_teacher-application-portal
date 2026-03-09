# REVIEW CHECKLIST — AI Self-Review Guide
## 123 ENGLISH Teacher Application Portal

Sử dụng checklist này để tự đánh giá code trước khi xuất bản. Đánh dấu ✅/❌ cho mỗi mục.

---

### 1. Logic & Functionality

- [ ] Code chạy đúng theo User Stories trong PRD?
- [ ] Form validation hoạt động chính xác (required fields, email format, password length)?
- [ ] Stepper hiển thị đúng step hiện tại, completed steps, và future steps?
- [ ] Countdown timer hoạt động đúng (5 → 0 → recording)?
- [ ] State transitions hợp lý (không deadlock, không invalid state)?
- [ ] Tất cả buttons có handler và hoạt động?

### 2. Security

- [ ] Không có XSS vulnerability (user input được sanitize trước khi render)?
- [ ] Password field dùng `type="password"` mặc định?
- [ ] Không hardcode credentials hoặc API keys?
- [ ] Không log sensitive data ra console?
- [ ] External links dùng `rel="noopener noreferrer"` (nếu `target="_blank"`)?

### 3. Performance

- [ ] Không re-render không cần thiết (kiểm tra dependency arrays trong useEffect)?
- [ ] Cleanup intervals/timeouts trong useEffect return?
- [ ] Không import toàn bộ library khi chỉ dùng 1-2 icons?
- [ ] Images/assets được optimize (nếu có)?
- [ ] Không duplicate code có thể abstract thành component/function?

### 4. UI/UX Quality

- [ ] Responsive trên mobile (≥375px) và desktop?
- [ ] Color palette đúng design system (primary-600, accent-500)?
- [ ] Typography nhất quán (Inter font, đúng font-weight)?
- [ ] Hover/focus states mượt mà (transition-all duration-300)?
- [ ] Error messages rõ ràng, vị trí đúng (inline dưới field)?
- [ ] Loading/disabled states cho buttons?
- [ ] Đủ whitespace, không chật chội?

### 5. Accessibility

- [ ] Tất cả interactive elements có `aria-label` hoặc visible label?
- [ ] Form inputs có `<label>` liên kết đúng (`htmlFor`)?
- [ ] Focus ring visible cho keyboard navigation?
- [ ] Color contrast đạt WCAG AA (4.5:1 cho text)?
- [ ] Semantic HTML (`<header>`, `<main>`, `<footer>`, `<form>`)?

### 6. Code Quality

- [ ] Tuân thủ naming conventions (PascalCase components, camelCase functions)?
- [ ] File structure đúng convention (`components/`, `pages/`)?
- [ ] Không có `console.log` trong production code?
- [ ] Không có unused imports/variables?
- [ ] Section comments chia rõ JSX layout?
- [ ] PropTypes hoặc default props cho reusable components?

### 7. Testing Readiness

- [ ] Components có thể test độc lập (không side effects ẩn)?
- [ ] Có unique IDs cho interactive elements (hỗ trợ E2E testing)?
- [ ] State logic tách biệt khỏi UI (dễ mock)?

---

### Scoring

| Điểm | Mức đánh giá |
|------|-------------|
| 90-100% | 🟢 Xuất sắc — sẵn sàng deploy |
| 75-89% | 🟡 Tốt — cần fix minor issues |
| 60-74% | 🟠 Trung bình — cần refactor |
| < 60% | 🔴 Kém — cần viết lại |
