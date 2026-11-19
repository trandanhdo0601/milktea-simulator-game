package com.example.milkteagame.game.dto;

/**
 * Loại tiêu chí sắp xếp bảng xếp hạng.
 */
public enum LeaderboardType {
    TOTAL_SCORE,    // Xếp theo tổng điểm tích lũy
    PERFECT_COUNT,  // Xếp theo số lượt pha chế hoàn hảo (100đ)
    SPEEDRUN        // Xếp theo tốc độ hoàn thành nhanh nhất (với điểm 100)
}
