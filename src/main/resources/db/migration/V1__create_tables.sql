-- V1__create_tables.sql
-- Tạo cấu trúc 3 bảng chính cho Milk Tea Game

CREATE TABLE IF NOT EXISTS users (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    username       VARCHAR(50)     NOT NULL,
    email          VARCHAR(255)    NOT NULL,
    password_hash  VARCHAR(255)    NOT NULL,
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_orders (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    tea_type    VARCHAR(30)     NOT NULL COMMENT 'BLACK_TEA | GREEN_TEA | OOLONG_TEA',
    milk_type   VARCHAR(30)     NOT NULL COMMENT 'FRESH_MILK | MILK_POWDER',
    sugar_level INT             NOT NULL COMMENT '0 | 25 | 50 | 75 | 100',
    ice_level   VARCHAR(20)     NOT NULL COMMENT 'NO_ICE | LESS | NORMAL',
    topping     VARCHAR(30)     NOT NULL COMMENT 'NONE | BLACK_PEARL | WHITE_PEARL | PUDDING',
    active      BOOLEAN         NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_results (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    order_id    BIGINT          NOT NULL,
    tea_type    VARCHAR(30)     NOT NULL,
    milk_type   VARCHAR(30)     NOT NULL,
    sugar_level INT             NOT NULL,
    ice_level   VARCHAR(20)     NOT NULL,
    topping     VARCHAR(30)     NOT NULL,
    score       INT             NOT NULL DEFAULT 0,
    is_perfect  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_results_user  FOREIGN KEY (user_id)  REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_results_order FOREIGN KEY (order_id) REFERENCES game_orders(id) ON DELETE RESTRICT,
    INDEX idx_results_user_id   (user_id),
    INDEX idx_results_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
