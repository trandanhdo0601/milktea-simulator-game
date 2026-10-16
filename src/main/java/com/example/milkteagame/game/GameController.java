package com.example.milkteagame.game;

import com.example.milkteagame.common.ApiResponse;
import com.example.milkteagame.game.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API game: đơn hàng, nộp bài, lịch sử, thống kê.
 * Tất cả endpoint yêu cầu xác thực JWT (cấu hình trong SecurityConfig).
 */
@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * GET /api/game/orders/random
     * Lấy đơn hàng ngẫu nhiên để bắt đầu lượt chơi.
     */
    @GetMapping("/orders/random")
    public ResponseEntity<ApiResponse<GameOrderResponse>> getRandomOrder() {
        GameOrderResponse order = gameService.getRandomOrder();
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    /**
     * GET /api/game/orders/{id}
     * Lấy chi tiết một đơn hàng theo ID.
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<GameOrderResponse>> getOrderById(@PathVariable Long id) {
        GameOrderResponse order = gameService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    /**
     * POST /api/game/submit
     * Nộp công thức pha chế. Backend tự tính điểm và lưu kết quả.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmitResponse>> submit(@Valid @RequestBody SubmitRequest request) {
        SubmitResponse result = gameService.submit(request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/game/history?page=0&size=10
     * Lịch sử các lượt chơi của người dùng hiện tại (phân trang).
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<GameHistoryResponse>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50)); // giới hạn tối đa 50
        Page<GameHistoryResponse> history = gameService.getHistory(pageable);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    /**
     * GET /api/game/statistics
     * Thống kê cá nhân: tổng lượt, perfect, điểm cao nhất, điểm trung bình.
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics() {
        StatisticsResponse stats = gameService.getStatistics();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
