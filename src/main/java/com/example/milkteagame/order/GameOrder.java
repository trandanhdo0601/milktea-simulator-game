package com.example.milkteagame.order;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity đơn hàng mẫu trong game.
 * Dữ liệu được seed bằng Flyway V2 migration.
 */
@Entity
@Table(name = "game_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "tea_type", nullable = false, length = 30)
    private String teaType;

    @Column(name = "milk_type", nullable = false, length = 30)
    private String milkType;

    @Column(name = "sugar_level", nullable = false)
    private Integer sugarLevel;

    @Column(name = "ice_level", nullable = false, length = 20)
    private String iceLevel;

    @Column(nullable = false, length = 30)
    private String topping;

    @Column(nullable = false)
    private Boolean active;
}
