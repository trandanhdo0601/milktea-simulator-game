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

## Tính năng gameplay (giai đoạn 1)
- **Chế độ chơi**: Thư giãn (không giờ) / Bình thường 45s / Giờ cao điểm 25s. Lưu ở `localStorage` (`mt_mode`), áp dụng từ đơn kế tiếp. Hết giờ mà ly đã đủ 5 thành phần thì tự nộp; chưa đủ thì khách bỏ đi (đơn không được tính, vì backend chưa có khái niệm timeout).
- **Combo**: số ly `PERFECT` liên tiếp, kèm kỷ lục, lưu theo tài khoản (`src/combo.js`). Lưu ý đây là dữ liệu phía client, chưa dùng được cho bảng xếp hạng thật.
- **Âm thanh**: tổng hợp bằng Web Audio (`src/sfx.js`), có nút tắt/bật.
- **Pháo giấy** khi ly hoàn hảo (`src/components/Confetti.jsx`), tự tắt khi bật `prefers-reduced-motion`.

## Đồng bộ với backend (thời gian chơi & bảng xếp hạng)
Theo `docs/FE_INTEGRATION_GUIDE.md` của backend:
- **Nộp bài**: `POST /api/game/submit` gửi thêm `durationSeconds` (giây, làm tròn 2 chữ số, giới hạn 0–3600 vì BE từ chối giá trị lớn hơn). Màn kết quả hiển thị `durationSeconds` mà BE trả về.
- **Lịch sử**: thêm cột "Thời gian pha" (`durationSeconds`; lượt cũ chưa có thì hiện `—`).
- **Thống kê**: thêm 3 ô `totalPlayTimeSeconds`, `averageDurationSeconds`, `fastestPerfectSeconds` (null → nhắc người chơi đạt 100 điểm).
- **Xếp hạng**: trang mới `/leaderboard` (`src/pages/Leaderboard.jsx`), gọi `GET /api/game/leaderboard?type=&limit=` với 3 tab `TOTAL_SCORE` / `PERFECT_COUNT` / `SPEEDRUN`. Hàng của người chơi được tô nổi bật; nếu ngoài top thì hiện thêm ở cuối từ `myRank`.
- Định dạng thời gian dùng chung ở `src/format.js`.
