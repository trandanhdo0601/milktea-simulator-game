-- V3__add_play_time_and_indexes.sql
-- Bổ sung cột lưu thời gian chơi (giây) và các chỉ mục cho Bảng xếp hạng

ALTER TABLE game_results
ADD COLUMN duration_seconds DECIMAL(6, 2) NOT NULL DEFAULT 0.00
COMMENT 'Thời gian hoàn thành lượt pha chế (giây)';

-- Index hỗ trợ truy vấn thống kê cá nhân và xếp hạng
CREATE INDEX idx_results_user_score ON game_results(user_id, score);
CREATE INDEX idx_results_user_duration ON game_results(user_id, duration_seconds);
CREATE INDEX idx_results_perfect_duration ON game_results(is_perfect, duration_seconds);
