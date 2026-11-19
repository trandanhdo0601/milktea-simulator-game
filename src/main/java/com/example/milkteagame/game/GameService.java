package com.example.milkteagame.game;

import com.example.milkteagame.game.dto.*;
import com.example.milkteagame.order.GameOrder;
import com.example.milkteagame.order.GameOrderRepository;
import com.example.milkteagame.user.User;
import com.example.milkteagame.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Logic game: lấy đơn, chấm điểm, lưu kết quả, thống kê.
 *
 * Trọng số chấm điểm:
 *   teaType   = 25 điểm
 *   milkType  = 20 điểm
 *   sugarLevel= 20 điểm
 *   iceLevel  = 15 điểm
 *   topping   = 20 điểm
 *   Tổng      = 100 điểm
 */
@Service
@RequiredArgsConstructor
public class GameService {

    // Trọng số điểm theo đặc tả
    private static final int WEIGHT_TEA    = 25;
    private static final int WEIGHT_MILK   = 20;
    private static final int WEIGHT_SUGAR  = 20;
    private static final int WEIGHT_ICE    = 15;
    private static final int WEIGHT_TOPPING = 20;

    private final GameOrderRepository orderRepository;
    private final GameResultRepository resultRepository;
    private final UserRepository userRepository;

    // ──────────────────────────────────────────────────────
    //  Đơn hàng
    // ──────────────────────────────────────────────────────

    /**
     * Lấy đơn hàng ngẫu nhiên (active = true).
     */
    public GameOrderResponse getRandomOrder() {
        GameOrder order = orderRepository.findRandomActive();
        if (order == null) {
            throw new NoSuchElementException("Không có đơn hàng nào trong hệ thống");
        }
        return GameOrderResponse.from(order);
    }

    /**
     * Lấy đơn hàng theo ID.
     */
    public GameOrderResponse getOrderById(Long id) {
        GameOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng #" + id));
        return GameOrderResponse.from(order);
    }

    // ──────────────────────────────────────────────────────
    //  Nộp bài và chấm điểm
    // ──────────────────────────────────────────────────────

    /**
     * Nhận công thức pha chế, so sánh với đơn hàng, tính điểm, lưu kết quả.
     * userId được lấy từ SecurityContext — không tin dữ liệu từ Frontend.
     */
    @Transactional
    public SubmitResponse submit(SubmitRequest request) {
        // 1. Xác định người chơi từ SecurityContext
        User currentUser = getCurrentUser();

        // 2. Lấy đơn hàng
        GameOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng #" + request.getOrderId()));

        // 3. So sánh và tính điểm
        List<SubmitResponse.IngredientDetail> details = new ArrayList<>();
        int totalScore = 0;

        // teaType
        boolean teaOk = order.getTeaType().equals(request.getTeaType());
        int teaPoints = teaOk ? WEIGHT_TEA : 0;
        totalScore += teaPoints;
        details.add(buildDetail("teaType", teaOk, teaPoints,
                request.getTeaType(), order.getTeaType()));

        // milkType
        boolean milkOk = order.getMilkType().equals(request.getMilkType());
        int milkPoints = milkOk ? WEIGHT_MILK : 0;
        totalScore += milkPoints;
        details.add(buildDetail("milkType", milkOk, milkPoints,
                request.getMilkType(), order.getMilkType()));

        // sugarLevel
        boolean sugarOk = order.getSugarLevel().equals(request.getSugarLevel());
        int sugarPoints = sugarOk ? WEIGHT_SUGAR : 0;
        totalScore += sugarPoints;
        details.add(buildDetail("sugarLevel", sugarOk, sugarPoints,
                String.valueOf(request.getSugarLevel()), String.valueOf(order.getSugarLevel())));

        // iceLevel
        boolean iceOk = order.getIceLevel().equals(request.getIceLevel());
        int icePoints = iceOk ? WEIGHT_ICE : 0;
        totalScore += icePoints;
        details.add(buildDetail("iceLevel", iceOk, icePoints,
                request.getIceLevel(), order.getIceLevel()));

        // topping
        boolean toppingOk = order.getTopping().equals(request.getTopping());
        int toppingPoints = toppingOk ? WEIGHT_TOPPING : 0;
        totalScore += toppingPoints;
        details.add(buildDetail("topping", toppingOk, toppingPoints,
                request.getTopping(), order.getTopping()));

        boolean isPerfect = totalScore == 100;
        String rating = computeRating(totalScore);
        double durationSeconds = request.getDurationSeconds() != null ? request.getDurationSeconds() : 0.0;

        // 4. Lưu kết quả vào DB (trong @Transactional)
        GameResult result = GameResult.builder()
                .user(currentUser)
                .orderId(order.getId())
                .teaType(request.getTeaType())
                .milkType(request.getMilkType())
                .sugarLevel(request.getSugarLevel())
                .iceLevel(request.getIceLevel())
                .topping(request.getTopping())
                .score(totalScore)
                .isPerfect(isPerfect)
                .durationSeconds(durationSeconds)
                .build();
        resultRepository.save(result);

        // 5. Trả kết quả
        return SubmitResponse.builder()
                .score(totalScore)
                .rating(rating)
                .isPerfect(isPerfect)
                .durationSeconds(durationSeconds)
                .details(details)
                .build();
    }

    // ──────────────────────────────────────────────────────
    //  Lịch sử & Thống kê
    // ──────────────────────────────────────────────────────

    /**
     * Lịch sử các lượt chơi của người dùng hiện tại, có phân trang.
     */
    public Page<GameHistoryResponse> getHistory(Pageable pageable) {
        User currentUser = getCurrentUser();
        return resultRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(GameHistoryResponse::from);
    }

    /**
     * Thống kê cá nhân: tổng lượt, lượt perfect, điểm cao nhất, điểm TB, tổng và tốc độ chơi.
     */
    public StatisticsResponse getStatistics() {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        long totalPlays    = resultRepository.countByUserId(userId);
        long perfectPlays  = resultRepository.countByUserIdAndIsPerfectTrue(userId);
        int  highestScore  = resultRepository.findMaxScoreByUserId(userId).orElse(0);
        int  averageScore  = resultRepository.findAvgScoreByUserId(userId)
                                             .map(Double::intValue).orElse(0);

        Double totalDuration = resultRepository.findTotalDurationByUserId(userId);
        Double avgDuration   = resultRepository.findAvgDurationByUserId(userId);
        Double fastest       = resultRepository.findFastestPerfectByUserId(userId).orElse(null);

        return StatisticsResponse.builder()
                .totalPlays(totalPlays)
                .perfectPlays(perfectPlays)
                .highestScore(highestScore)
                .averageScore(averageScore)
                .totalPlayTimeSeconds(totalDuration != null ? Math.round(totalDuration * 100.0) / 100.0 : 0.0)
                .averageDurationSeconds(avgDuration != null ? Math.round(avgDuration * 100.0) / 100.0 : 0.0)
                .fastestPerfectSeconds(fastest != null ? Math.round(fastest * 100.0) / 100.0 : null)
                .build();
    }

    /**
     * Lấy bảng xếp hạng theo tiêu chí (TOTAL_SCORE, PERFECT_COUNT, SPEEDRUN)
     * kèm theo thứ hạng của người chơi hiện tại.
     */
    public LeaderboardResponse getLeaderboard(LeaderboardType type, int limit) {
        LeaderboardType actualType = type != null ? type : LeaderboardType.TOTAL_SCORE;
        int effectiveLimit = limit > 0 ? Math.min(limit, 100) : 20;

        User currentUser = getCurrentUser();
        Long currentUserId = currentUser.getId();

        List<LeaderboardRowProjection> allRows = switch (actualType) {
            case TOTAL_SCORE -> resultRepository.findAllLeaderboardByTotalScore();
            case PERFECT_COUNT -> resultRepository.findAllLeaderboardByPerfectCount();
            case SPEEDRUN -> resultRepository.findAllLeaderboardBySpeedrun();
        };

        List<LeaderboardEntryResponse> topPlayers = new ArrayList<>();
        LeaderboardEntryResponse myRank = null;

        for (int i = 0; i < allRows.size(); i++) {
            LeaderboardRowProjection row = allRows.get(i);
            int rank = i + 1;
            LeaderboardEntryResponse entry = LeaderboardEntryResponse.builder()
                    .rank(rank)
                    .userId(row.getUserId())
                    .username(row.getUsername())
                    .totalScore(row.getTotalScore())
                    .totalPlays(row.getTotalPlays())
                    .perfectPlays(row.getPerfectPlays())
                    .totalPlayTimeSeconds(row.getTotalPlayTimeSeconds() != null ? Math.round(row.getTotalPlayTimeSeconds() * 100.0) / 100.0 : 0.0)
                    .avgScore(row.getAvgScore() != null ? Math.round(row.getAvgScore() * 10.0) / 10.0 : 0.0)
                    .fastestPerfectSeconds(row.getFastestPerfectSeconds() != null ? Math.round(row.getFastestPerfectSeconds() * 100.0) / 100.0 : null)
                    .build();

            if (i < effectiveLimit) {
                topPlayers.add(entry);
            }
            if (row.getUserId().equals(currentUserId)) {
                myRank = entry;
            }
            if (i >= effectiveLimit && myRank != null) {
                break;
            }
        }

        return LeaderboardResponse.builder()
                .type(actualType)
                .topPlayers(topPlayers)
                .myRank(myRank)
                .build();
    }

    // ──────────────────────────────────────────────────────
    //  Helper methods
    // ──────────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    private SubmitResponse.IngredientDetail buildDetail(String ingredient,
                                                         boolean correct,
                                                         int earnedPoints,
                                                         String submitted,
                                                         String expected) {
        return SubmitResponse.IngredientDetail.builder()
                .ingredient(ingredient)
                .correct(correct)
                .earnedPoints(earnedPoints)
                .submitted(submitted)
                // Chỉ hiển thị expected khi sai — giúp Frontend show feedback rõ hơn
                .expected(correct ? null : expected)
                .build();
    }

    private String computeRating(int score) {
        if (score == 100) return "PERFECT";
        if (score >= 80)  return "GREAT";
        if (score >= 50)  return "NEEDS_IMPROVEMENT";
        return "FAILED";
    }
}
