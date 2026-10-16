# Milk Tea FE (React + Vite)

## Chạy
1. Chạy backend Spring Boot ở cổng 8080 (xem README của backend).
2. `npm install`
3. `npm run dev` → mở http://localhost:5173

Vite proxy `/api` sang `http://localhost:8080`, nên không bị lỗi CORS khi dev.
Khi deploy, đặt `VITE_API_URL` trong `.env` trỏ về backend.
