package com.example.milkteagame.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Thông tin một hàng (người chơi) trong bảng xếp hạng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryResponse {
    private Integer rank;
    private Long userId;
    private String username;
    private Long totalScore;
    private Long totalPlays;
    private Long perfectPlays;
    private Double totalPlayTimeSeconds;
    private Double avgScore;
    private Double fastestPerfectSeconds;
}
