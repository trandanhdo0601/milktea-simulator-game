package com.example.milkteagame.game;

import com.example.milkteagame.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity lưu kết quả mỗi lượt pha chế của người chơi.
 */
@Entity
@Table(name = "game_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

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
    private Integer score;

    @Column(name = "is_perfect", nullable = false)
    private Boolean isPerfect;

    @Column(name = "duration_seconds", nullable = false, columnDefinition = "DECIMAL(6,2)")
    private Double durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.durationSeconds == null) {
            this.durationSeconds = 0.0;
        }
    }
}
