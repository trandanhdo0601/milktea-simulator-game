package com.example.milkteagame.game.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * DTO thống kê cá nhân tính từ game_results.
 */
@Getter
@Builder
public class StatisticsResponse {
    private long totalPlays;
    private long perfectPlays;
    private int highestScore;
    private int averageScore;
    private double totalPlayTimeSeconds;
    private double averageDurationSeconds;
    private Double fastestPerfectSeconds;
}
