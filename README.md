# test_nodejs_orm

API Node.js + Express 5 + TypeScript, dùng Prisma ORM với PostgreSQL. Có đăng ký / đăng nhập (JWT access + refresh token), phân quyền theo role, quản lý lớp học và giáo viên.

## Công nghệ

- Node.js, Express 5, TypeScript (chạy bằng `tsx`)
- Prisma 6 + PostgreSQL
- JWT (`jsonwebtoken`), `bcrypt`, `zod`
- Vitest để viết test

## Yêu cầu

- Node.js 20+
- PostgreSQL đang chạy

## Cài đặt & chạy

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env (xem mục "Biến môi trường")

# 3. Sinh Prisma Client (thư mục generated/ không được commit)
npx prisma generate

# 4. Áp dụng migrations vào DB (xem mục "Migration (Prisma Migrate)")
npx prisma migrate deploy

# 5. Chạy server
npm run dev               # tự reload khi sửa code
npm start                 # chạy 1 lần
```

Server chạy tại `http://localhost:3000`.

## Biến môi trường

Tạo file `.env` ở thư mục gốc (file này đã nằm trong `.gitignore`):

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```

| Biến                 | Bắt buộc | Mô tả                                                                                |
| -------------------- | -------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`       | có       | Chuỗi kết nối PostgreSQL, ví dụ `postgresql://postgres:postgres@localhost:5432/mydb` |
| `JWT_ACCESS_SECRET`  | có       | Khoá ký access token                                                                 |
| `JWT_REFRESH_SECRET` | có       | Khoá ký refresh token, **phải khác** `JWT_ACCESS_SECRET`                             |

Thiếu `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (hoặc hai giá trị trùng nhau) thì app throw lỗi ngay khi khởi động. Giá trị trong `.env.example` chỉ là mẫu, hãy đổi thành chuỗi ngẫu nhiên đủ dài khi chạy thật.

## Migration (Prisma Migrate)

Mọi thay đổi cấu trúc DB được lưu thành file SQL có thứ tự trong `prisma/migrations/` và commit cùng code, để máy nào cũng dựng được DB giống nhau. Bản đầu tiên là `0_init` (toàn bộ bảng hiện có).

**Máy mới / DB trống** (clone về lần đầu, hoặc deploy):

```bash
npx prisma migrate deploy
```

**Khi sửa `prisma/schema.prisma`** (thêm bảng, cột, index...):

```bash
npx prisma migrate dev --name ten_thay_doi   # ví dụ: add_phone_to_account
```

Lệnh này sinh thư mục migration mới, áp vào DB local và chạy lại `prisma generate`. Đọc file `migration.sql` vừa sinh trước khi commit, rồi commit cả thư mục đó cùng `schema.prisma`.

**Kiểm tra trạng thái:**

```bash
npx prisma migrate status
```

**DB đã có sẵn bảng** (tạo trước khi dùng migrations) thì không chạy `deploy` ngay, mà đánh dấu bản đầu là đã áp dụng:

```bash
npx prisma migrate resolve --applied 0_init
```

Lưu ý:

- Không sửa hay xoá file migration đã commit; muốn đổi tiếp thì tạo migration mới.
- Đã dùng `migrate` thì không dùng `prisma db push` cho DB đó, vì lịch sử migration sẽ lệch với DB thật.
- `migrate dev` chỉ dùng ở máy phát triển. Môi trường thật dùng `migrate deploy`.
- Bảng `request_teacher` có check constraint chưa nằm trong `0_init`; DB dựng mới từ migration sẽ thiếu ràng buộc này cho tới khi bổ sung.

## Scripts

| Lệnh                           | Mô tả                                     |
| ------------------------------ | ----------------------------------------- |
| `npm run dev`                  | Chạy server, tự reload khi code đổi       |
| `npm start`                    | Chạy server                               |
| `npm run typecheck`            | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `npx vitest`                   | Chạy test ở chế độ watch                  |
| `npx vitest run`               | Chạy test một lần                         |
| `npx vitest run -t "tên test"` | Chạy các test khớp tên                    |

## Cấu trúc thư mục

```
index.ts                  Khởi tạo app, middleware, error handler
router.ts                 Khai báo route
controller/               Nhận request, gọi service, trả response
service/                  Logic nghiệp vụ; AppError + errorHandler nằm ở AppError.ts
repository/               Truy vấn DB qua Prisma
midlewareConfig/          jwtAuthencation (xác thực), Authorization (phân quyền role)
config/database.ts        PrismaClient
prisma/schema.prisma      Định nghĩa bảng
prisma/migrations/        Lịch sử migration (file SQL theo thứ tự)
test/                     Test Vitest
```

## API

| Method | Đường dẫn               | Quyền     | Mô tả                                                      |
| ------ | ----------------------- | --------- | ---------------------------------------------------------- |
| POST   | `/register`             | công khai | Đăng ký tài khoản                                          |
| POST   | `/login`                | công khai | Đăng nhập, trả `accessTokenNodeRe` và `refreshTokenNodeRe` |
| POST   | `/refreshToken`         | công khai | Cấp access token mới từ `refreshToken`                     |
| POST   | `/api/v1/public/logout` | công khai | Đăng xuất, gửi `refreshTokenNodeRe` trong body             |
| POST   | `/admin/createClass`    | ADMIN     | Tạo lớp                                                    |
| POST   | `/admin/searchClass`    | ADMIN     | Tìm lớp                                                    |
| POST   | `/admin/createTeacher`  | ADMIN     | Tạo giáo viên                                              |
| POST   | `/admin/searchTeacher`  | ADMIN     | Tìm giáo viên                                              |
| GET    | `/admin/allTeacher`     | ADMIN     | Danh sách giáo viên                                        |

Các route `/admin/*` cần header `Authorization: Bearer <accessToken>` và tài khoản có role `ADMIN`.

## Xử lý lỗi

Controller không dùng `try/catch`. Ở bất kỳ đâu (service, controller, middleware) chỉ cần:

```ts
throw new AppError(400, { message: "Dữ liệu không hợp lệ" });
```

Error handler toàn cục (`errorHandler` trong `service/AppError.ts`, đăng ký cuối `index.ts`) sẽ trả đúng status và body đó về client:

- `AppError` → status và body của nó
- Lỗi có status 4xx từ thư viện (ví dụ JSON sai cú pháp) → 4xx kèm message
- Lỗi khác → `500 { "message": "Internal server error" }` (chi tiết chỉ log ở server)
- Route không tồn tại → `404 { "message": "Not found: METHOD /path" }`

## Test

```bash
npx vitest run

npx vitest run "test/tên file cần chạy"

```

- Test controller dùng `vi.spyOn` để thay service bằng bản giả, nên không đụng DB.
- Test đăng ký nếu không mock service sẽ ghi dữ liệu thật vào DB đang trỏ bởi `DATABASE_URL`. Nên dùng DB riêng cho test.
