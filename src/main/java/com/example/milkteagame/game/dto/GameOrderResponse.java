package com.example.milkteagame.game.dto;

import com.example.milkteagame.order.GameOrder;
import lombok.Builder;
import lombok.Getter;

/**
 * DTO trả về thông tin đơn hàng cho Frontend.
 */
@Getter
@Builder
public class GameOrderResponse {
    private Long id;
    private String name;
    private String teaType;
    private String milkType;
    private Integer sugarLevel;
    private String iceLevel;
    private String topping;

    public static GameOrderResponse from(GameOrder order) {
        return GameOrderResponse.builder()
                .id(order.getId())
                .name(order.getName())
                .teaType(order.getTeaType())
                .milkType(order.getMilkType())
                .sugarLevel(order.getSugarLevel())
                .iceLevel(order.getIceLevel())
                .topping(order.getTopping())
                .build();
    }
}
