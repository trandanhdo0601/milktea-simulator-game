# 🧋 Milk Tea Mini Game — Fullstack Web Game

Web game mô phỏng pha chế trà sữa.
- **Backend:** Java 21 + Spring Boot 3.3 + MySQL 8.4 + Spring Security (JWT)
- **Frontend:** React 18 + Vite

---

## 🏗️ Cấu trúc project

```
milk-tea-game/
├── src/
│   ├── main/java/com/example/milkteagame/   # Spring Boot Backend code
│   │   ├── config/                          # JWT, Security Config, CORS
│   │   ├── auth/                            # AuthController, AuthService, dto/
│   │   ├── user/                            # User entity, UserRepository
│   │   ├── order/                           # GameOrder entity, GameOrderRepository
│   │   ├── game/                            # GameController, GameService, GameResult, dto/
│   │   └── common/                          # ApiResponse, GlobalExceptionHandler
│   ├── main/resources/
│   │   ├── application.yml
│   │   └── db/migration/                    # Flyway migrations (tables, seed data)
│   ├── test/                                # Backend unit tests
│   ├── App.jsx                              # Frontend Root Component
│   ├── main.jsx                             # Frontend Entry point
│   ├── api.js                               # API Client & Axios/Fetch wrapper
│   ├── auth.jsx                             # Auth Context
│   ├── combo.js                             # Logic Combo game
│   ├── sfx.js                               # Hiệu ứng âm thanh
│   ├── constants.js                         # Công thức & hằng số game
│   ├── styles.css                           # Giao diện CSS
│   ├── components/                          # UI components (Cup, Swatch, Icons...)
│   └── pages/                               # Pages: Play, History, Stats, AuthPage
├── docker-compose.yml                       # MySQL 8.4
├── .env.example                             # Mẫu biến môi trường
├── index.html                               # Frontend HTML
├── package.json                             # Frontend dependencies & scripts
├── vite.config.js                           # Vite config (Proxy /api -> localhost:8080)
└── pom.xml                                  # Maven dependencies
```

---

## 🚀 Hướng dẫn chạy ứng dụng

### 1. Khởi động MySQL Database

```bash
# Khởi động MySQL qua Docker
docker compose up -d

# Kiểm tra container đang chạy (Port 3307)
docker compose ps
```

### 2. Chạy Backend (Spring Boot - Port 8080)

Cấu hình các biến môi trường:
```
MYSQL_PASSWORD=MilkTeaApp@2024!
JWT_SECRET=bWlsa1RlYUdhbWVTZWNyZXRLZXlGb3JKV1RBdXRoZW50aWNhdGlvbjIwMjQ=
JWT_EXPIRATION=86400000
```

Chạy từ terminal hoặc IntelliJ IDEA:
```bash
./mvnw.cmd spring-boot:run
```
Flyway sẽ tự động tạo bảng và seed 10 đơn hàng mẫu khi ứng dụng khởi động.

### 3. Chạy Frontend (React Vite - Port 5173)

Cài đặt thư viện và khởi chạy Vite dev server:
```bash
npm.cmd install
npm.cmd run dev
```
Mở trình duyệt: **http://localhost:5173**

> **Lưu ý:** Vite đã cấu hình proxy tự động chuyển tiếp tất cả request `/api/*` về `http://localhost:8080`, tránh hoàn toàn lỗi CORS khi chạy dev.

---

## 📡 Danh sách API

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/api/auth/register` | Public | Đăng ký tài khoản |
| POST | `/api/auth/login` | Public | Đăng nhập, nhận JWT |
| GET | `/api/game/orders/random` | JWT | Lấy đơn hàng ngẫu nhiên |
| GET | `/api/game/orders/{id}` | JWT | Xem chi tiết đơn hàng |
| POST | `/api/game/submit` | JWT | Nộp công thức pha chế (hỗ trợ `durationSeconds`) |
| GET | `/api/game/history?page=0&size=10` | JWT | Lịch sử chơi (kèm thời gian pha chế `durationSeconds`) |
| GET | `/api/game/statistics` | JWT | Thống kê cá nhân (kèm tổng thời gian chơi, tốc độ TB, kỷ lục) |
| GET | `/api/game/leaderboard?type=...&limit=...` | JWT | Bảng xếp hạng (`TOTAL_SCORE`, `PERFECT_COUNT`, `SPEEDRUN`) |

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

## ⚙️ Công nghệ sử dụng

- **Backend:** Java 21 LTS, Spring Boot 3.3.5, Spring Security, JJWT, Spring Data JPA, Hibernate, MySQL 8.4, Flyway Migration, Maven.
- **Frontend:** React 18, React Router DOM, Vite, Vanilla CSS.
