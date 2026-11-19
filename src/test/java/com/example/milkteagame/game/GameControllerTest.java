package com.example.milkteagame.game;

import com.example.milkteagame.config.JwtTokenProvider;
import com.example.milkteagame.game.dto.LeaderboardEntryResponse;
import com.example.milkteagame.game.dto.LeaderboardResponse;
import com.example.milkteagame.game.dto.LeaderboardType;
import com.example.milkteagame.game.dto.StatisticsResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GameController.class)
@AutoConfigureMockMvc(addFilters = false) // Bỏ qua JWT filter khi test controller layer
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "player01")
    @DisplayName("GET /api/game/leaderboard trả về 200 và dữ liệu bảng xếp hạng")
    void getLeaderboard_returnsOk() throws Exception {
        LeaderboardEntryResponse entry = LeaderboardEntryResponse.builder()
                .rank(1)
                .userId(10L)
                .username("master_tea")
                .totalScore(800L)
                .totalPlays(8L)
                .perfectPlays(8L)
                .totalPlayTimeSeconds(45.5)
                .avgScore(100.0)
                .fastestPerfectSeconds(3.5)
                .build();

        LeaderboardResponse response = LeaderboardResponse.builder()
                .type(LeaderboardType.TOTAL_SCORE)
                .topPlayers(List.of(entry))
                .myRank(entry)
                .build();

        given(gameService.getLeaderboard(LeaderboardType.TOTAL_SCORE, 20)).willReturn(response);

        mockMvc.perform(get("/api/game/leaderboard")
                        .param("type", "TOTAL_SCORE")
                        .param("limit", "20")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("TOTAL_SCORE"))
                .andExpect(jsonPath("$.data.topPlayers[0].username").value("master_tea"))
                .andExpect(jsonPath("$.data.topPlayers[0].totalPlayTimeSeconds").value(45.5))
                .andExpect(jsonPath("$.data.topPlayers[0].fastestPerfectSeconds").value(3.5))
                .andExpect(jsonPath("$.data.myRank.rank").value(1));
    }

    @Test
    @WithMockUser(username = "player01")
    @DisplayName("GET /api/game/statistics trả về thông số thời gian chơi")
    void getStatistics_returnsOk() throws Exception {
        StatisticsResponse stats = StatisticsResponse.builder()
                .totalPlays(12L)
                .perfectPlays(6L)
                .highestScore(100)
                .averageScore(85)
                .totalPlayTimeSeconds(120.5)
                .averageDurationSeconds(10.04)
                .fastestPerfectSeconds(4.2)
                .build();

        given(gameService.getStatistics()).willReturn(stats);

        mockMvc.perform(get("/api/game/statistics").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalPlayTimeSeconds").value(120.5))
                .andExpect(jsonPath("$.data.averageDurationSeconds").value(10.04))
                .andExpect(jsonPath("$.data.fastestPerfectSeconds").value(4.2));
    }
}
