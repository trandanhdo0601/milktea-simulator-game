package com.example.milkteagame.game.dto;

import com.example.milkteagame.game.GameResult;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * DTO lịch sử một lượt chơi, không trả ra user entity.
 */
@Getter
@Builder
public class GameHistoryResponse {
    private Long id;
    private Long orderId;
    private String teaType;
    private String milkType;
    private Integer sugarLevel;
    private String iceLevel;
    private String topping;
    private Integer score;
    private String rating;
    private Boolean isPerfect;
    private Double durationSeconds;
    private LocalDateTime createdAt;

    public static GameHistoryResponse from(GameResult result) {
        return GameHistoryResponse.builder()
                .id(result.getId())
                .orderId(result.getOrderId())
                .teaType(result.getTeaType())
                .milkType(result.getMilkType())
                .sugarLevel(result.getSugarLevel())
                .iceLevel(result.getIceLevel())
                .topping(result.getTopping())
                .score(result.getScore())
                .rating(ratingFromScore(result.getScore()))
                .isPerfect(result.getIsPerfect())
                .durationSeconds(result.getDurationSeconds())
                .createdAt(result.getCreatedAt())
                .build();
    }

    private static String ratingFromScore(int score) {
        if (score == 100) return "PERFECT";
        if (score >= 80)  return "GREAT";
        if (score >= 50)  return "NEEDS_IMPROVEMENT";
        return "FAILED";
    }
}
