package com.example.milkteagame.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO trả về danh sách bảng xếp hạng kèm vị trí của người dùng hiện tại.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {
    private LeaderboardType type;
    private List<LeaderboardEntryResponse> topPlayers;
    private LeaderboardEntryResponse myRank; // null nếu user chưa chơi lượt nào
}
