# 📘 Hướng dẫn Tích hợp Frontend: Thời gian chơi & Bảng xếp hạng

Tài liệu này dành cho thành viên phát triển **Frontend (FE)** để tích hợp 2 tính năng mới:
1. **Theo dõi thời gian chơi (Play Time Tracking)**
2. **Bảng xếp hạng (Leaderboard)**

---

## 1. Theo dõi thời gian chơi (Play Time Tracking)

### 1.1. Cập nhật API Nộp bài: `POST /api/game/submit`
Frontend gửi thêm trường `durationSeconds` (kiểu số thực, tính bằng giây, ví dụ: `4.52`).
> *Lưu ý: Nếu FE chưa gửi trường này, Backend sẽ tự động gán mặc định `0.0` (không làm lỗi code cũ).*

**Request Body mẫu:**
```json
{
  "orderId": 1,
  "teaType": "BLACK_TEA",
  "milkType": "FRESH_MILK",
  "sugarLevel": 50,
  "iceLevel": "LESS",
  "topping": "BLACK_PEARL",
  "durationSeconds": 4.85
}
```

**Response trả về (mới):**
Bổ sung `durationSeconds` để FE hiển thị:
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "score": 100,
    "rating": "PERFECT",
    "isPerfect": true,
    "durationSeconds": 4.85,
    "details": [...]
  }
}
```

### 1.2. Cập nhật API Lịch sử: `GET /api/game/history`
Mỗi phần tử trong mảng `content` giờ có thêm trường `durationSeconds` (Double).
FE có thể hiển thị thêm nhãn thời gian ở bảng lịch sử (ví dụ: `⏱ 4.8s`).

### 1.3. Cập nhật API Thống kê: `GET /api/game/statistics`
**Response trả về:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "totalPlays": 15,
    "perfectPlays": 8,
    "highestScore": 100,
    "averageScore": 88,
    "totalPlayTimeSeconds": 92.4,
    "averageDurationSeconds": 6.16,
    "fastestPerfectSeconds": 3.75
  }
}
```
* `totalPlayTimeSeconds`: Tổng thời gian chơi của người dùng (tính bằng giây). FE có thể định dạng thành phút/giây (ví dụ: `1m 32s`).
* `averageDurationSeconds`: Thời gian pha chế trung bình mỗi ly (ví dụ: `6.2s / ly`).
* `fastestPerfectSeconds`: Kỷ lục pha nhanh nhất với điểm 100 (null nếu người chơi chưa từng đạt 100đ).

---

## 2. Bảng xếp hạng (Leaderboard)

### 2.1. API Lấy Bảng Xếp Hạng: `GET /api/game/leaderboard`
Yêu cầu Header: `Authorization: Bearer <access_token>`

**Query Parameters:**
* `type`: Tiêu chí xếp hạng (Mặc định: `TOTAL_SCORE`)
  * `TOTAL_SCORE`: Xếp hạng theo **Tổng điểm tích lũy**.
  * `PERFECT_COUNT`: Xếp hạng theo **Số lượt hoàn hảo (100đ)**.
  * `SPEEDRUN`: Xếp hạng theo **Tốc độ nhanh nhất với điểm 100**.
* `limit`: Số lượng người chơi hiển thị trong bảng (Mặc định: `20`, tối đa `100`).

**Ví dụ Request:**
```http
GET /api/game/leaderboard?type=TOTAL_SCORE&limit=20
```

**Response trả về:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "type": "TOTAL_SCORE",
    "topPlayers": [
      {
        "rank": 1,
        "userId": 5,
        "username": "barista_master",
        "totalScore": 1500,
        "totalPlays": 15,
        "perfectPlays": 15,
        "totalPlayTimeSeconds": 75.2,
        "avgScore": 100.0,
        "fastestPerfectSeconds": 3.2
      },
      {
        "rank": 2,
        "userId": 2,
        "username": "tra_sua_so_1",
        "totalScore": 1280,
        "totalPlays": 14,
        "perfectPlays": 11,
        "totalPlayTimeSeconds": 90.0,
        "avgScore": 91.4,
        "fastestPerfectSeconds": 4.1
      }
    ],
    "myRank": {
      "rank": 5,
      "userId": 1,
      "username": "player01",
      "totalScore": 850,
      "totalPlays": 10,
      "perfectPlays": 7,
      "totalPlayTimeSeconds": 62.5,
      "avgScore": 85.0,
      "fastestPerfectSeconds": 4.8
    }
  }
}
```

> **Lưu ý quan trọng cho FE:**
> - `myRank` chứa thông tin thứ hạng của người dùng hiện tại đang đăng nhập. Nếu người chơi chưa từng chơi lượt nào, `myRank` sẽ là `null`.
> - Trường `fastestPerfectSeconds` sẽ là `null` đối với những người chơi chưa từng đạt 100 điểm.
