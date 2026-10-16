# 🧋 Milk Tea Mini Game — Backend API

Web game mô phỏng pha chế trà sữa. Backend xây dựng bằng **Java 21 + Spring Boot 3.3 + MySQL 8.4**.

## 🏗️ Cấu trúc project

```
milk-tea-game/
├── src/main/java/com/example/milkteagame/
│   ├── config/                 # JWT Provider, JWT Filter, Security Config
│   ├── auth/                   # AuthController, AuthService, dto/
│   ├── user/                   # User entity, UserRepository
│   ├── order/                  # GameOrder entity, GameOrderRepository
│   ├── game/                   # GameController, GameService, GameResult, dto/
│   └── common/                 # ApiResponse, GlobalExceptionHandler
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       ├── V1__create_tables.sql   # Tạo 3 bảng
│       └── V2__seed_game_orders.sql # 10 đơn hàng mẫu
├── src/test/                   # Unit tests (GameServiceTest)
├── docker-compose.yml          # MySQL 8.4
├── .env                        # Biến môi trường (KHÔNG commit)
└── pom.xml
```

## 🚀 Hướng dẫn chạy

### Bước 1 — Khởi động MySQL bằng Docker

```bash
# Copy .env nếu chưa có
cp .env.example .env   # rồi sửa mật khẩu

# Khởi động MySQL
docker compose up -d

# Kiểm tra container
docker compose ps
```

### Bước 2 — Cấu hình biến môi trường trong IntelliJ

Vào **Run > Edit Configurations > Environment Variables**, thêm:

```
MYSQL_PASSWORD=MilkTeaApp@2024!
JWT_SECRET=bWlsa1RlYUdhbWVTZWNyZXRLZXlGb3JKV1RBdXRoZW50aWNhdGlvbjIwMjQ=
JWT_EXPIRATION=86400000
```

> Hoặc dùng plugin **EnvFile** để load tự động từ file `.env`.

### Bước 3 — Chạy Spring Boot

Mở IntelliJ → Run `MilkTeaGameApplication`.

Flyway sẽ tự động tạo bảng và seed 10 đơn hàng khi app khởi động.

---

## 📡 Danh sách API

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản |
| POST | `/api/auth/login` | Public | Đăng nhập, nhận JWT |
| GET | `/api/game/orders/random` | JWT | Lấy đơn hàng ngẫu nhiên |
| GET | `/api/game/orders/{id}` | JWT | Xem chi tiết đơn hàng |
| POST | `/api/game/submit` | JWT | Nộp công thức pha chế |
| GET | `/api/game/history?page=0&size=10` | JWT | Lịch sử chơi |
| GET | `/api/game/statistics` | JWT | Thống kê cá nhân |

### Header xác thực

```
Authorization: Bearer <access_token>
```

---

## 🎮 Thành phần pha chế

| Thành phần | Giá trị hợp lệ | Điểm |
|-----------|---------------|------|
| teaType | `BLACK_TEA`, `GREEN_TEA`, `OOLONG_TEA` | 25 |
| milkType | `FRESH_MILK`, `MILK_POWDER` | 20 |
| sugarLevel | `0`, `25`, `50`, `75`, `100` | 20 |
| iceLevel | `NO_ICE`, `LESS`, `NORMAL` | 15 |
| topping | `NONE`, `BLACK_PEARL`, `WHITE_PEARL`, `PUDDING` | 20 |

### Rating

| Điểm | Rating |
|------|--------|
| 100 | PERFECT |
| 80–99 | GREAT |
| 50–79 | NEEDS_IMPROVEMENT |
| 0–49 | FAILED |

---

## 🗄️ Database

Kết nối từ IntelliJ/Workbench:
- Host: `localhost`
- Port: `3307`
- Database: `milk_tea_game`
- Username: `game_user`
- Password: giá trị `MYSQL_PASSWORD` trong `.env`

---

## 🧪 Kiểm thử với Postman

Project đã có sẵn file collection: [`postman_collection.json`](file:///f:/Project/boba/postman_collection.json).
1. Mở Postman → chọn **Import** → chọn file `postman_collection.json`.
2. Chạy request **Login User** → script tự động lưu `accessToken` vào collection variable `token`.
3. Mọi request tiếp theo (Get Random Order, Submit Recipe, History, Statistics) sẽ tự động đính kèm token.

### Các endpoint mẫu:

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "player01",
  "email": "player01@example.com",
  "password": "StrongPass123!"
}
```

### 2. Đăng nhập

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "player01",
  "password": "StrongPass123!"
}
```

Copy `data.accessToken` từ response.

### 3. Lấy đơn hàng ngẫu nhiên

```http
GET http://localhost:8080/api/game/orders/random
Authorization: Bearer <token>
```

### 4. Nộp công thức

```http
POST http://localhost:8080/api/game/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "teaType": "BLACK_TEA",
  "milkType": "FRESH_MILK",
  "sugarLevel": 50,
  "iceLevel": "LESS",
  "topping": "BLACK_PEARL"
}
```

---

## ⚙️ Công nghệ

- Java 21 LTS
- Spring Boot 3.3.5
- Spring Security + JWT (JJWT 0.12.6)
- Spring Data JPA + Hibernate
- MySQL 8.4 (Docker)
- Flyway Migration
- Lombok
- Maven 3.9.x
