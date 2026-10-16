package com.example.milkteagame.game;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GameResultRepository extends JpaRepository<GameResult, Long> {

    /** Lấy lịch sử lượt chơi của một người dùng, phân trang, mới nhất trước */
    Page<GameResult> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Tổng số lượt chơi */
    long countByUserId(Long userId);

    /** Số lượt perfect */
    long countByUserIdAndIsPerfectTrue(Long userId);

    /** Điểm cao nhất */
    @Query("SELECT MAX(r.score) FROM GameResult r WHERE r.user.id = :userId")
    Optional<Integer> findMaxScoreByUserId(@Param("userId") Long userId);

    /** Điểm trung bình */
    @Query("SELECT AVG(r.score) FROM GameResult r WHERE r.user.id = :userId")
    Optional<Double> findAvgScoreByUserId(@Param("userId") Long userId);
}
