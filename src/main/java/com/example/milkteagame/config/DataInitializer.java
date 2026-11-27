package com.example.milkteagame.config;

import com.example.milkteagame.order.GameOrder;
import com.example.milkteagame.order.GameOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Khởi tạo dữ liệu mẫu cho game_orders khi bảng còn trống.
 * Chạy cả với H2 (mặc định) lẫn MySQL (khi Flyway đã migrate xong vẫn an toàn vì có check count).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final GameOrderRepository gameOrderRepository;

    @Override
    public void run(String... args) {
        if (gameOrderRepository.count() > 0) {
            log.info("DataInitializer: game_orders đã có dữ liệu, bỏ qua seed.");
            return;
        }

        log.info("DataInitializer: seed 10 đơn hàng mẫu...");

        List<GameOrder> orders = List.of(
            GameOrder.builder().name("Trà Sữa Trân Châu Đen")
                .teaType("BLACK_TEA").milkType("FRESH_MILK")
                .sugarLevel(50).iceLevel("LESS").topping("BLACK_PEARL").active(true).build(),

            GameOrder.builder().name("Trà Xanh Sữa Bột")
                .teaType("GREEN_TEA").milkType("MILK_POWDER")
                .sugarLevel(100).iceLevel("NORMAL").topping("NONE").active(true).build(),

            GameOrder.builder().name("Trà Ô Long Pudding")
                .teaType("OOLONG_TEA").milkType("FRESH_MILK")
                .sugarLevel(25).iceLevel("NORMAL").topping("PUDDING").active(true).build(),

            GameOrder.builder().name("Trà Đen Trân Châu Trắng")
                .teaType("BLACK_TEA").milkType("MILK_POWDER")
                .sugarLevel(75).iceLevel("NO_ICE").topping("WHITE_PEARL").active(true).build(),

            GameOrder.builder().name("Trà Xanh Thanh Đạm")
                .teaType("GREEN_TEA").milkType("FRESH_MILK")
                .sugarLevel(0).iceLevel("NO_ICE").topping("NONE").active(true).build(),

            GameOrder.builder().name("Trà Ô Long Đặc Biệt")
                .teaType("OOLONG_TEA").milkType("MILK_POWDER")
                .sugarLevel(100).iceLevel("NORMAL").topping("BLACK_PEARL").active(true).build(),

            GameOrder.builder().name("Trà Đen Pudding")
                .teaType("BLACK_TEA").milkType("FRESH_MILK")
                .sugarLevel(50).iceLevel("NORMAL").topping("PUDDING").active(true).build(),

            GameOrder.builder().name("Trà Xanh Trân Châu Trắng")
                .teaType("GREEN_TEA").milkType("MILK_POWDER")
                .sugarLevel(75).iceLevel("LESS").topping("WHITE_PEARL").active(true).build(),

            GameOrder.builder().name("Trà Ô Long Thuần Túy")
                .teaType("OOLONG_TEA").milkType("FRESH_MILK")
                .sugarLevel(25).iceLevel("LESS").topping("NONE").active(true).build(),

            GameOrder.builder().name("Trà Đen Sữa Bột Không Đường")
                .teaType("BLACK_TEA").milkType("MILK_POWDER")
                .sugarLevel(0).iceLevel("NORMAL").topping("BLACK_PEARL").active(true).build()
        );

        gameOrderRepository.saveAll(orders);
        log.info("DataInitializer: đã seed {} đơn hàng mẫu.", orders.size());
    }
}
