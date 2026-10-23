package com.example.milkteagame.game;

import com.example.milkteagame.game.dto.SubmitRequest;
import com.example.milkteagame.game.dto.SubmitResponse;
import com.example.milkteagame.order.GameOrder;
import com.example.milkteagame.order.GameOrderRepository;
import com.example.milkteagame.user.User;
import com.example.milkteagame.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

/**
 * Unit test cho logic chấm điểm trong GameService.
 */
@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameOrderRepository orderRepository;
    @Mock
    private GameResultRepository resultRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GameService gameService;

    private GameOrder sampleOrder;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        // Đơn hàng mẫu
        sampleOrder = GameOrder.builder()
                .id(1L)
                .name("Trà Sữa Trân Châu Đen")
                .teaType("BLACK_TEA")
                .milkType("FRESH_MILK")
                .sugarLevel(50)
                .iceLevel("LESS")
                .topping("BLACK_PEARL")
                .active(true)
                .build();

        // User mẫu
        sampleUser = User.builder()
                .id(1L)
                .username("player01")
                .build();

        // Mock SecurityContext
        Authentication auth = mock(Authentication.class);
        given(auth.getName()).willReturn("player01");
        SecurityContext securityContext = mock(SecurityContext.class);
        given(securityContext.getAuthentication()).willReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        given(userRepository.findByUsername("player01")).willReturn(Optional.of(sampleUser));
        org.mockito.Mockito.lenient().when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
    }

    @Test
    @DisplayName("Nộp đúng tất cả 5 thành phần → 100 điểm PERFECT")
    void submit_allCorrect_returns100() {
        SubmitRequest request = buildRequest("BLACK_TEA", "FRESH_MILK", 50, "LESS", "BLACK_PEARL");

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getScore()).isEqualTo(100);
        assertThat(response.getIsPerfect()).isTrue();
        assertThat(response.getRating()).isEqualTo("PERFECT");
        assertThat(response.getDetails()).hasSize(5);
        response.getDetails().forEach(d -> assertThat(d.getCorrect()).isTrue());
    }

    @Test
    @DisplayName("Sai topping và đá → 65 điểm NEEDS_IMPROVEMENT")
    void submit_wrongIceAndTopping_returns65() {
        // Sai iceLevel (15đ) + sai topping (20đ) = mất 35 điểm → còn 65
        SubmitRequest request = buildRequest("BLACK_TEA", "FRESH_MILK", 50, "NORMAL", "PUDDING");

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getScore()).isEqualTo(65);
        assertThat(response.getIsPerfect()).isFalse();
        assertThat(response.getRating()).isEqualTo("NEEDS_IMPROVEMENT");

        // Kiểm tra chi tiết từng thành phần
        var details = response.getDetails();
        assertThat(findDetail(details, "teaType").getCorrect()).isTrue();
        assertThat(findDetail(details, "milkType").getCorrect()).isTrue();
        assertThat(findDetail(details, "sugarLevel").getCorrect()).isTrue();
        assertThat(findDetail(details, "iceLevel").getCorrect()).isFalse();
        assertThat(findDetail(details, "topping").getCorrect()).isFalse();
    }

    @Test
    @DisplayName("Sai tất cả → 0 điểm FAILED")
    void submit_allWrong_returns0() {
        SubmitRequest request = buildRequest("GREEN_TEA", "MILK_POWDER", 0, "NO_ICE", "PUDDING");

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getScore()).isEqualTo(0);
        assertThat(response.getRating()).isEqualTo("FAILED");
        response.getDetails().forEach(d -> {
            assertThat(d.getCorrect()).isFalse();
            assertThat(d.getEarnedPoints()).isEqualTo(0);
            assertThat(d.getExpected()).isNotNull(); // expected hiển thị khi sai
        });
    }

    @Test
    @DisplayName("Sai chỉ trà → 75 điểm NEEDS_IMPROVEMENT (range 50-79)")
    void submit_wrongTeaOnly_returns75() {
        // Sai teaType (25đ) → 100 - 25 = 75 điểm → NEEDS_IMPROVEMENT (50–79)
        SubmitRequest request = buildRequest("GREEN_TEA", "FRESH_MILK", 50, "LESS", "BLACK_PEARL");

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getScore()).isEqualTo(75);
        assertThat(response.getRating()).isEqualTo("NEEDS_IMPROVEMENT");
    }

    @Test
    @DisplayName("Sai chỉ đá → 85 điểm GREAT (range 80-99)")
    void submit_wrongIceOnly_returns85() {
        // Sai iceLevel (15đ) → 100 - 15 = 85 điểm → GREAT (80–99)
        SubmitRequest request = buildRequest("BLACK_TEA", "FRESH_MILK", 50, "NORMAL", "BLACK_PEARL");

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getScore()).isEqualTo(85);
        assertThat(response.getRating()).isEqualTo("GREAT");
    }

    @Test
    @DisplayName("Khi đúng, expected không hiển thị trong response")
    void submit_correctIngredient_expectedIsNull() {
        SubmitRequest request = buildRequest("BLACK_TEA", "FRESH_MILK", 50, "LESS", "BLACK_PEARL");

        SubmitResponse response = gameService.submit(request);

        response.getDetails().forEach(d ->
                assertThat(d.getExpected()).isNull()
        );
    }

    @Test
    @DisplayName("Nộp bài kèm thời gian chơi (durationSeconds) trả về đúng thời gian")
    void submit_withDurationSeconds_persistsAndReturnsDuration() {
        SubmitRequest request = buildRequest("BLACK_TEA", "FRESH_MILK", 50, "LESS", "BLACK_PEARL");
        request.setDurationSeconds(5.42);

        SubmitResponse response = gameService.submit(request);

        assertThat(response.getDurationSeconds()).isEqualTo(5.42);
    }

    @Test
    @DisplayName("Thống kê cá nhân trả về đầy đủ các chỉ số thời gian chơi")
    void getStatistics_includesPlayTimeMetrics() {
        given(resultRepository.countByUserId(1L)).willReturn(10L);
        given(resultRepository.countByUserIdAndIsPerfectTrue(1L)).willReturn(5L);
        given(resultRepository.findMaxScoreByUserId(1L)).willReturn(Optional.of(100));
        given(resultRepository.findAvgScoreByUserId(1L)).willReturn(Optional.of(88.5));
        given(resultRepository.findTotalDurationByUserId(1L)).willReturn(65.4);
        given(resultRepository.findAvgDurationByUserId(1L)).willReturn(6.54);
        given(resultRepository.findFastestPerfectByUserId(1L)).willReturn(Optional.of(3.82));

        var stats = gameService.getStatistics();

        assertThat(stats.getTotalPlays()).isEqualTo(10L);
        assertThat(stats.getPerfectPlays()).isEqualTo(5L);
        assertThat(stats.getHighestScore()).isEqualTo(100);
        assertThat(stats.getAverageScore()).isEqualTo(88);
        assertThat(stats.getTotalPlayTimeSeconds()).isEqualTo(65.4);
        assertThat(stats.getAverageDurationSeconds()).isEqualTo(6.54);
        assertThat(stats.getFastestPerfectSeconds()).isEqualTo(3.82);
    }

    @Test
    @DisplayName("Bảng xếp hạng trả về top người chơi và xác định đúng thứ hạng của user hiện tại")
    void getLeaderboard_mapsTopPlayersAndMyRankCorrectly() {
        LeaderboardRowProjection row1 = mockLeaderboardRow(2L, "barista_pro", 500L, 5L, 5L, 25.0, 100.0, 4.2);
        LeaderboardRowProjection row2 = mockLeaderboardRow(1L, "player01", 450L, 5L, 4L, 30.0, 90.0, 5.1);

        given(resultRepository.findAllLeaderboardByTotalScore()).willReturn(java.util.List.of(row1, row2));

        var response = gameService.getLeaderboard(com.example.milkteagame.game.dto.LeaderboardType.TOTAL_SCORE, 10);

        assertThat(response.getType()).isEqualTo(com.example.milkteagame.game.dto.LeaderboardType.TOTAL_SCORE);
        assertThat(response.getTopPlayers()).hasSize(2);
        assertThat(response.getTopPlayers().get(0).getUsername()).isEqualTo("barista_pro");
        assertThat(response.getTopPlayers().get(0).getRank()).isEqualTo(1);

        assertThat(response.getMyRank()).isNotNull();
        assertThat(response.getMyRank().getUserId()).isEqualTo(1L);
        assertThat(response.getMyRank().getRank()).isEqualTo(2);
    }

    private LeaderboardRowProjection mockLeaderboardRow(
            Long userId, String username, Long totalScore, Long totalPlays,
            Long perfectPlays, Double totalPlayTime, Double avgScore, Double fastest) {
        return new LeaderboardRowProjection() {
            @Override public Long getUserId() { return userId; }
            @Override public String getUsername() { return username; }
            @Override public Long getTotalScore() { return totalScore; }
            @Override public Long getTotalPlays() { return totalPlays; }
            @Override public Long getPerfectPlays() { return perfectPlays; }
            @Override public Double getTotalPlayTimeSeconds() { return totalPlayTime; }
            @Override public Double getAvgScore() { return avgScore; }
            @Override public Double getFastestPerfectSeconds() { return fastest; }
        };
    }

    // ── helpers ──────────────────────────────────────────

    private SubmitRequest buildRequest(String tea, String milk, int sugar, String ice, String topping) {
        SubmitRequest r = new SubmitRequest();
        r.setOrderId(1L);
        r.setTeaType(tea);
        r.setMilkType(milk);
        r.setSugarLevel(sugar);
        r.setIceLevel(ice);
        r.setTopping(topping);
        return r;
    }

    private SubmitResponse.IngredientDetail findDetail(
            java.util.List<SubmitResponse.IngredientDetail> details, String ingredient) {
        return details.stream()
                .filter(d -> d.getIngredient().equals(ingredient))
                .findFirst()
                .orElseThrow();
    }
}
