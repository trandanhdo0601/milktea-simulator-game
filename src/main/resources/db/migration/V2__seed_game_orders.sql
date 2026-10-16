-- V2__seed_game_orders.sql
-- Thêm 10 đơn hàng mẫu cho Milk Tea Game

INSERT INTO game_orders (name, tea_type, milk_type, sugar_level, ice_level, topping, active) VALUES
-- 1. Trà sữa trân châu đen classic
('Trà Sữa Trân Châu Đen', 'BLACK_TEA', 'FRESH_MILK', 50, 'LESS', 'BLACK_PEARL', TRUE),

-- 2. Trà xanh sữa bột ngọt đầy đá
('Trà Xanh Sữa Bột', 'GREEN_TEA', 'MILK_POWDER', 100, 'NORMAL', 'NONE', TRUE),

-- 3. Trà ô long với pudding ít ngọt
('Trà Ô Long Pudding', 'OOLONG_TEA', 'FRESH_MILK', 25, 'NORMAL', 'PUDDING', TRUE),

-- 4. Trà đen sữa bột trân châu trắng không đá
('Trà Đen Trân Châu Trắng', 'BLACK_TEA', 'MILK_POWDER', 75, 'NO_ICE', 'WHITE_PEARL', TRUE),

-- 5. Trà xanh không đường không đá không topping
('Trà Xanh Thanh Đạm', 'GREEN_TEA', 'FRESH_MILK', 0, 'NO_ICE', 'NONE', TRUE),

-- 6. Trà ô long sữa bột trân châu đen ngọt đầy đá
('Trà Ô Long Đặc Biệt', 'OOLONG_TEA', 'MILK_POWDER', 100, 'NORMAL', 'BLACK_PEARL', TRUE),

-- 7. Trà đen pudding 50% đường bình thường
('Trà Đen Pudding', 'BLACK_TEA', 'FRESH_MILK', 50, 'NORMAL', 'PUDDING', TRUE),

-- 8. Trà xanh sữa bột trân châu trắng ít đá
('Trà Xanh Trân Châu Trắng', 'GREEN_TEA', 'MILK_POWDER', 75, 'LESS', 'WHITE_PEARL', TRUE),

-- 9. Trà ô long không topping ít ngọt
('Trà Ô Long Thuần Túy', 'OOLONG_TEA', 'FRESH_MILK', 25, 'LESS', 'NONE', TRUE),

-- 10. Trà đen sữa bột trân châu đen không đường
('Trà Đen Sữa Bột Không Đường', 'BLACK_TEA', 'MILK_POWDER', 0, 'NORMAL', 'BLACK_PEARL', TRUE);
