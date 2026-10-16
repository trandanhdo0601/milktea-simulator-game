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
        given(orderRepository.findById(1L)).willReturn(Optional.of(sampleOrder));
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
