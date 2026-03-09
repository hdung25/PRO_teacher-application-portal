# CONVENTIONS — Coding Standards & Rules
## 123 ENGLISH Teacher Application Portal

### 1. Quy tắc đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `ApplicationForm`, `Stepper` |
| File component | PascalCase.jsx | `ApplicationForm.jsx` |
| Function / Variable | camelCase | `handleSubmit`, `formData` |
| Constant | UPPER_SNAKE_CASE | `COUNTRIES`, `STEPS` |
| CSS class (Tailwind) | kebab-case utility | `btn-primary`, `input-field` |
| Folder | lowercase | `components/`, `pages/` |

### 2. Cấu trúc file component

```jsx
// 1. Imports (React hooks → third-party → local)
import { useState } from 'react'
import { Icon } from 'lucide-react'

// 2. Constants (nếu chỉ dùng trong file này)
const ITEMS = [...]

// 3. Component function
function ComponentName({ prop1, prop2 }) {
  // 3a. State
  const [state, setState] = useState(initialValue)

  // 3b. Effects
  useEffect(() => { ... }, [])

  // 3c. Handlers
  const handleAction = () => { ... }

  // 3d. Render
  return (...)
}

// 4. Export
export default ComponentName
```

### 3. Styling Rules

- **Ưu tiên Tailwind utility classes** trong JSX; không viết CSS inline ngoại trừ dynamic styles (`style={{ width }}`).
- **Reusable classes** (`.btn-primary`, `.card`, `.input-field`) định nghĩa trong `index.css` bằng `@layer components`.
- **Không dùng `!important`**.
- **Responsive**: dùng `sm:`, `md:`, `lg:` breakpoints. Mobile-first.
- **Spacing**: dùng scale 4px của Tailwind (`p-1` = 4px, `p-2` = 8px...).

### 4. Error Handling

- Form validation: validate tất cả fields khi submit, hiển thị lỗi inline dưới mỗi field.
- Sử dụng object `errors` state để track lỗi → clear lỗi khi user sửa field đó.
- Không throw error không xử lý; luôn có fallback UI.

### 5. Comment & Documentation

- **Không comment** code hiển nhiên (ví dụ: `// set state`).
- **Comment** logic phức tạp, workaround, hoặc business rules.
- **JSDoc** cho shared utility functions (khi có).
- **Section comments** (`{/* Header */}`, `{/* Form Fields */}`) để chia layout trong JSX.

### 6. Testing (khi mở rộng)

- Unit test components với **Vitest** + **React Testing Library**.
- Đặt file test cạnh component: `ComponentName.test.jsx`.
- Mỗi component phải test: render, user interaction, edge cases.
- Minimum coverage target: 80%.

### 7. Git Conventions

- **Branch naming**: `feature/`, `fix/`, `refactor/` prefix.
- **Commit message**: `type: short description` (ví dụ: `feat: add application form validation`).
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
