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

    /** Tổng thời gian chơi của người dùng (tính bằng giây) */
    @Query("SELECT COALESCE(SUM(r.durationSeconds), 0.0) FROM GameResult r WHERE r.user.id = :userId")
    Double findTotalDurationByUserId(@Param("userId") Long userId);

    /** Thời gian trung bình mỗi lượt của người dùng (giây) */
    @Query("SELECT COALESCE(AVG(r.durationSeconds), 0.0) FROM GameResult r WHERE r.user.id = :userId")
    Double findAvgDurationByUserId(@Param("userId") Long userId);

    /** Kỷ lục hoàn thành hoàn hảo (100đ) nhanh nhất của người dùng */
    @Query("SELECT MIN(r.durationSeconds) FROM GameResult r WHERE r.user.id = :userId AND r.isPerfect = true AND r.durationSeconds > 0")
    Optional<Double> findFastestPerfectByUserId(@Param("userId") Long userId);

    /** Bảng xếp hạng theo tổng điểm tích lũy */
    @Query(value = """
            SELECT 
                u.id AS userId,
                u.username AS username,
                CAST(COALESCE(SUM(gr.score), 0) AS SIGNED) AS totalScore,
                COUNT(gr.id) AS totalPlays,
                CAST(COALESCE(SUM(CASE WHEN gr.is_perfect = 1 THEN 1 ELSE 0 END), 0) AS SIGNED) AS perfectPlays,
                CAST(COALESCE(SUM(gr.duration_seconds), 0.0) AS DOUBLE) AS totalPlayTimeSeconds,
                CAST(COALESCE(AVG(gr.score), 0.0) AS DOUBLE) AS avgScore,
                MIN(CASE WHEN gr.is_perfect = 1 AND gr.duration_seconds > 0 THEN gr.duration_seconds ELSE NULL END) AS fastestPerfectSeconds
            FROM users u
            JOIN game_results gr ON u.id = gr.user_id
            GROUP BY u.id, u.username
            ORDER BY totalScore DESC, perfectPlays DESC, totalPlays ASC
            """, nativeQuery = true)
    java.util.List<LeaderboardRowProjection> findAllLeaderboardByTotalScore();

    /** Bảng xếp hạng theo số lượt hoàn hảo (100đ) */
    @Query(value = """
            SELECT 
                u.id AS userId,
                u.username AS username,
                CAST(COALESCE(SUM(gr.score), 0) AS SIGNED) AS totalScore,
                COUNT(gr.id) AS totalPlays,
                CAST(COALESCE(SUM(CASE WHEN gr.is_perfect = 1 THEN 1 ELSE 0 END), 0) AS SIGNED) AS perfectPlays,
                CAST(COALESCE(SUM(gr.duration_seconds), 0.0) AS DOUBLE) AS totalPlayTimeSeconds,
                CAST(COALESCE(AVG(gr.score), 0.0) AS DOUBLE) AS avgScore,
                MIN(CASE WHEN gr.is_perfect = 1 AND gr.duration_seconds > 0 THEN gr.duration_seconds ELSE NULL END) AS fastestPerfectSeconds
            FROM users u
            JOIN game_results gr ON u.id = gr.user_id
            GROUP BY u.id, u.username
            ORDER BY perfectPlays DESC, totalScore DESC, totalPlays ASC
            """, nativeQuery = true)
    java.util.List<LeaderboardRowProjection> findAllLeaderboardByPerfectCount();

    /** Bảng xếp hạng tốc độ hoàn thành nhanh nhất với điểm 100 */
    @Query(value = """
            SELECT 
                u.id AS userId,
                u.username AS username,
                CAST(COALESCE(SUM(gr.score), 0) AS SIGNED) AS totalScore,
                COUNT(gr.id) AS totalPlays,
                CAST(COALESCE(SUM(CASE WHEN gr.is_perfect = 1 THEN 1 ELSE 0 END), 0) AS SIGNED) AS perfectPlays,
                CAST(COALESCE(SUM(gr.duration_seconds), 0.0) AS DOUBLE) AS totalPlayTimeSeconds,
                CAST(COALESCE(AVG(gr.score), 0.0) AS DOUBLE) AS avgScore,
                MIN(CASE WHEN gr.is_perfect = 1 AND gr.duration_seconds > 0 THEN gr.duration_seconds ELSE NULL END) AS fastestPerfectSeconds
            FROM users u
            JOIN game_results gr ON u.id = gr.user_id
            GROUP BY u.id, u.username
            HAVING fastestPerfectSeconds IS NOT NULL
            ORDER BY fastestPerfectSeconds ASC, totalScore DESC
            """, nativeQuery = true)
    java.util.List<LeaderboardRowProjection> findAllLeaderboardBySpeedrun();
}
