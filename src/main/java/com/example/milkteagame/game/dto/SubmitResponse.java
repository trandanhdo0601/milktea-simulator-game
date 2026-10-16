package com.example.milkteagame.game.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * DTO trả về kết quả chấm điểm sau khi pha chế.
 */
@Getter
@Builder
public class SubmitResponse {
    private Integer score;
    private String rating;
    private Boolean isPerfect;
    private List<IngredientDetail> details;

    @Getter
    @Builder
    public static class IngredientDetail {
        private String ingredient;
        private Boolean correct;
        private Integer earnedPoints;
        private String submitted;    // giá trị người chơi gửi
        private String expected;     // giá trị đúng (chỉ hiện khi sai)
    }
}
