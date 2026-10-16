package com.example.milkteagame;

import com.example.milkteagame.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke test: kiểm tra JPA context và Flyway được disabled đúng cách trong test.
 * Không cần full Spring context vì GameServiceTest đã cover logic chính.
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class MilkTeaGameApplicationTests {

    @Test
    void contextLoads() {
        // @DataJpaTest slice load được JPA context là đủ cho smoke test
        assertThat(true).isTrue();
    }
}

