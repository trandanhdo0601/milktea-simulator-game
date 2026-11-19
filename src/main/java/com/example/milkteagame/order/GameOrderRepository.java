package com.example.milkteagame.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GameOrderRepository extends JpaRepository<GameOrder, Long> {

    List<GameOrder> findByActiveTrue();

    /**
     * Lấy một đơn hàng ngẫu nhiên trong số các đơn active.
     * Dùng ORDER BY RAND() LIMIT 1 — phù hợp với dataset nhỏ (10 bản ghi).
     */
    @Query(value = "SELECT * FROM game_orders WHERE active = TRUE ORDER BY RAND() LIMIT 1",
           nativeQuery = true)
    GameOrder findRandomActive();
}
