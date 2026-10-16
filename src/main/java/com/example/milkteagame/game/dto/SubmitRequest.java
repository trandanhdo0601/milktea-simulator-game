package com.example.milkteagame.game.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO nhận công thức pha chế từ Frontend.
 * Backend sẽ tự tính điểm, không tin điểm từ Frontend.
 */
@Getter
@Setter
public class SubmitRequest {

    @NotNull(message = "orderId không được để trống")
    private Long orderId;

    @NotBlank(message = "teaType không được để trống")
    @Pattern(regexp = "^(BLACK_TEA|GREEN_TEA|OOLONG_TEA)$",
             message = "teaType phải là BLACK_TEA, GREEN_TEA hoặc OOLONG_TEA")
    private String teaType;

    @NotBlank(message = "milkType không được để trống")
    @Pattern(regexp = "^(FRESH_MILK|MILK_POWDER)$",
             message = "milkType phải là FRESH_MILK hoặc MILK_POWDER")
    private String milkType;

    @NotNull(message = "sugarLevel không được để trống")
    @Min(value = 0, message = "sugarLevel không hợp lệ")
    @Max(value = 100, message = "sugarLevel không hợp lệ")
    private Integer sugarLevel;

    @NotBlank(message = "iceLevel không được để trống")
    @Pattern(regexp = "^(NO_ICE|LESS|NORMAL)$",
             message = "iceLevel phải là NO_ICE, LESS hoặc NORMAL")
    private String iceLevel;

    @NotBlank(message = "topping không được để trống")
    @Pattern(regexp = "^(NONE|BLACK_PEARL|WHITE_PEARL|PUDDING)$",
             message = "topping phải là NONE, BLACK_PEARL, WHITE_PEARL hoặc PUDDING")
    private String topping;

    /** Validate sugarLevel chỉ nhận 0, 25, 50, 75, 100 */
    @AssertTrue(message = "sugarLevel phải là 0, 25, 50, 75 hoặc 100")
    public boolean isSugarLevelValid() {
        if (sugarLevel == null) return true; // let @NotNull handle it
        return sugarLevel == 0 || sugarLevel == 25 || sugarLevel == 50
                || sugarLevel == 75 || sugarLevel == 100;
    }
}
