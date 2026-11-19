package com.example.milkteagame.game;

/**
 * Interface projection hứng dữ liệu tính toán aggregate từ DB cho Bảng xếp hạng.
 */
public interface LeaderboardRowProjection {
    Long getUserId();
    String getUsername();
    Long getTotalScore();
    Long getTotalPlays();
    Long getPerfectPlays();
    Double getTotalPlayTimeSeconds();
    Double getAvgScore();
    Double getFastestPerfectSeconds();
}
