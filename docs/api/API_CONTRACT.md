# How2Prompt — API Contract Phase 1 (BE → FE)

> File chính: **`openapi_phase1.yaml`** (OpenAPI 3.0.3)
> 33 path · 37 endpoint · schema đã đồng bộ với `AuthController` và DTO hiện tại · bao phủ toàn bộ scope Phase 1 (MVP).

---

## 1. Cách FE sử dụng file này

### a) Xem & thử API bằng Swagger UI
```bash
# Cách nhanh nhất - dùng Docker
docker run -p 8081:8080 -e SWAGGER_JSON=/spec/openapi_phase1.yaml \
  -v $(pwd):/spec swaggerapi/swagger-ui
# Mở http://localhost:8081
```
Hoặc dán nội dung file vào **https://editor.swagger.io**.

### b) Chạy Mock Server (FE code trước khi BE xong)
```bash
# Dùng Prism (Stoplight) - mock server tự sinh từ contract
npx @stoplight/prism-cli mock openapi_phase1.yaml
# Mock chạy tại http://localhost:4010, trả về data theo "example" trong spec
```
→ FE có thể gọi thật vào mock để build UI **ngay hôm nay**, không cần chờ BE.

### c) Sinh TypeScript types & API client tự động
```bash
# Sinh type cho FE (khuyến nghị)
npx openapi-typescript openapi_phase1.yaml -o src/types/api.ts

# Hoặc sinh cả client (axios/fetch)
npx openapi-generator-cli generate -i openapi_phase1.yaml \
  -g typescript-axios -o src/api
```

### d) Import vào Postman
Postman → Import → chọn `openapi_phase1.yaml` → tự tạo collection đầy đủ.

---

## 2. Quy ước BẮT BUỘC hai bên tuân thủ

| Chủ đề | Quy ước |
|---|---|
| **Base URL** | `/api/v1` |
| **Field naming** | `camelCase` cho JSON request/response · `kebab-case` cho URL · `snake_case` chỉ ở tầng Database |
| **Timestamp** | ISO 8601 UTC: `2026-07-22T01:29:13Z` |
| **ID** | UUID v4 (string) |
| **i18n** | Trường dịch được trả object `{ "en": "...", "vi": "..." }`. FE render theo `user.locale`, fallback `en`. |
| **Response wrapper** | Mọi endpoint trả dữ liệu (trừ `204`) bọc trong `ApiResponse<T>`: `{ "data": {...}, "meta": {...} }` |
| **Auth header** | `Authorization: Bearer <accessToken>` |
| **Access token** | Sống 15 phút. Hết hạn → `401` code `TOKEN_EXPIRED` → gọi `/auth/refresh` |
| **Refresh token** | BE set trong **httpOnly cookie** (`refresh_token`) — FE KHÔNG đọc/gửi thủ công. Được **rotate** (cấp cookie mới) mỗi lần refresh thành công. |
| **Pagination** | Offset-based (Spring Data `Pageable`): `?page=0&size=20` (`page` bắt đầu từ 0). `meta` trả về `PageMeta` gồm `page`, `size`, `totalElements`, `totalPages`, `hasNext`, `hasPrevious`. |
| **Lỗi** | Luôn dạng `{ "error": { code, message, details, traceId } }` |

---

## 3. Luồng Auth (FE cần nắm)

### Đăng ký (email/password)
```
POST /auth/register ──► 201 RegisterResponse { user, message }
       │
   (không có accessToken — user cần verify email hoặc đăng nhập)
       │
       ▼
POST /auth/login ──► AuthResponse { accessToken, expiresIn } + Set-Cookie: refresh_token
```

### Đăng nhập email/password hoặc Google
```
POST /auth/login            ──► { accessToken, expiresIn } + Set-Cookie: refresh_token
POST /auth/oauth/google      (body: { idToken })
       │  FE lấy idToken bằng Google Identity Services (GIS) rồi gửi lên,
       │  BE verify với Google, tạo user nếu chưa có, trả về như login thường
       ▼
       { accessToken, expiresIn } + Set-Cookie: refresh_token
       │
       ▼
Lưu accessToken trong memory (KHÔNG localStorage — tránh XSS)
       │
       ▼
Mọi request gắn header Authorization: Bearer <accessToken>
       │
   token hết hạn (401 TOKEN_EXPIRED)
       │
       ▼
POST /auth/refresh (cookie tự gửi) ──► accessToken mới + refresh_token được rotate
       │
   nếu refresh cũng 401 ──► logout, về trang login
```

> Lưu ý: **không có** endpoint `/auth/oauth/google/callback` — Google OAuth chỉ dùng một request `POST /auth/oauth/google` với `idToken`, không phải Authorization Code flow.

### Verify email
```
POST /auth/verify-email  (body: { token })  ──► 200 xác minh thành công / 410 token hết hạn
POST /auth/resend-verification              ──► 202 Accepted (gửi lại email bất đồng bộ)
```

### Logout
```
POST /auth/logout ──► 204, revoke refreshToken hiện tại,
                       Set-Cookie: refresh_token=""; Max-Age=0
```

---

## 4. Xử lý Guest (chưa đăng nhập) — QUAN TRỌNG

Guest **được phép generate prompt** nhưng giới hạn **3 lần/ngày/IP**.

- Endpoint `POST /templates/{id}/generate` cho phép gọi **không cần token**.
- Khi Guest, FE **bắt buộc** gửi header `X-Guest-Fingerprint` (dùng thư viện như `@fingerprintjs/fingerprintjs`).
- Response có `remainingQuota` → FE hiển thị số lượt còn lại.
- Hết quota → `429` code `GUEST_QUOTA_EXCEEDED` → FE hiện modal "Đăng ký nhận 50 lượt/ngày".
- Guest KHÔNG có: lưu history server-side (dùng `localStorage`), favorite, admin.

---

## 5. Bảng mã lỗi (error codes) Phase 1

| HTTP | code | Ý nghĩa |
|---|---|---|
| 401 | `TOKEN_EXPIRED` | Access token hết hạn → refresh |
| 401 | `INVALID_CREDENTIALS` | Sai email/mật khẩu |
| 403 | `FORBIDDEN` | Không đủ quyền (vd endpoint admin) |
| 404 | `NOT_FOUND` | Không tìm thấy tài nguyên |
| 409 | `EMAIL_ALREADY_EXISTS` | Email đã đăng ký |
| 409 | `USERNAME_TAKEN` | Username đã tồn tại |
| 410 | `TOKEN_CONSUMED` | Token reset/verify đã dùng hoặc hết hạn |
| 413 | `PAYLOAD_TOO_LARGE` | File upload quá lớn (>2MB) |
| 422 | `VALIDATION_ERROR` | Dữ liệu không hợp lệ (xem `details`) |
| 429 | `RATE_LIMITED` | Vượt tần suất chung |
| 429 | `GUEST_QUOTA_EXCEEDED` | Guest hết lượt generate/ngày |

---

## 6. Nhóm endpoint theo màn hình FE

| Màn hình FE | Endpoint dùng |
|---|---|
| **Đăng ký / Đăng nhập** | `/auth/register`, `/auth/login`, `/auth/oauth/google`, `/auth/refresh` |
| **Verify email** | `/auth/verify-email`, `/auth/resend-verification` |
| **Quên mật khẩu** | `/auth/forgot-password`, `/auth/reset-password` |
| **Trang chủ / Explore** | `/templates`, `/templates/featured`, `/templates/trending`, `/categories`, `/tags`, `/ai-models` |
| **Chi tiết template** | `/templates/{id}`, `/templates/{id}/favorite` |
| **Màn Generate prompt** | `/templates/{id}/generate` |
| **Lịch sử** | `/generated-prompts`, `/generated-prompts/{id}` |
| **Yêu thích** | `/favorites`, `/templates/{id}/favorite` |
| **Cài đặt hồ sơ** | `/users/me`, `/users/me/avatar` |
| **Admin panel** | `/admin/*` |

---

## 7. Điểm FE cần lưu ý khi build màn Generate (core MVP)

1. Gọi `GET /templates/{id}` → nhận `currentVersion.variables[]`.
2. Với mỗi variable, render input theo `inputType`:
   - `text` → input; `textarea` → textarea; `select`/`multiselect` → dropdown dùng `options[]`;
   - `number`/`slider` → dùng `validation.min/max`; `boolean` → toggle; `date` → date picker.
3. Label/placeholder/helpText lấy theo `locale` từ object i18n.
4. Validate client-side theo `validation` (min, max, regex, isRequired).
5. Preview realtime **client-side** (thay `{{varKey}}` trong `promptBody`) — chỉ để UX.
6. Bấm Generate → `POST /templates/{id}/generate` → dùng `finalPrompt` **từ BE** (source of truth), KHÔNG dùng preview client làm kết quả cuối.

---

## 8. Versioning contract

- Contract này là **v1.0.1** (đã đồng bộ camelCase + `AuthController`/DTO thực tế, thay cursor-based bằng offset-based pagination).
- Mọi thay đổi breaking → tăng major, thông báo cho FE.
- Thêm field mới (non-breaking) → tăng minor, FE không cần đổi gì.
- BE sẽ host bản live tại `/swagger-ui` để luôn đồng bộ.
