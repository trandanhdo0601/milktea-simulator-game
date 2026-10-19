# Milk Tea FE (React + Vite)

## Chạy
1. Chạy backend Spring Boot ở cổng 8080 (xem README của backend).
2. `npm install`
3. `npm run dev` → mở http://localhost:5173

Vite proxy `/api` sang `http://localhost:8080`, nên không bị lỗi CORS khi dev.
Khi deploy, đặt `VITE_API_URL` trong `.env` trỏ về backend.

## Giao diện
- Phong cách "quầy order": phiếu order như hóa đơn, ly trà SVG đổi theo lựa chọn, viền mực + bóng cứng kiểu sticker.
- Font: Baloo 2 (tiêu đề, con số) + Be Vietnam Pro (nội dung), nạp từ Google Fonts trong `index.html`.
- Màu và bo góc khai báo ở `:root` đầu `src/styles.css`.
- `src/components/`: `Cup` (ly), `Swatch` (icon từng lựa chọn), `Icons` (icon SVG), `Ui` (báo lỗi, trạng thái trống).
- Mobile: thanh điều hướng chuyển xuống đáy màn hình, bảng lịch sử chuyển thành thẻ.
- Tôn trọng `prefers-reduced-motion` (tắt toàn bộ hiệu ứng chuyển động).
