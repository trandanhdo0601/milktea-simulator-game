package com.example.milkteagame.auth;

import com.example.milkteagame.auth.dto.LoginRequest;
import com.example.milkteagame.auth.dto.LoginResponse;
import com.example.milkteagame.auth.dto.RegisterRequest;
import com.example.milkteagame.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý đăng ký và đăng nhập.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Tạo tài khoản mới. Trả 201 Created khi thành công.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ."));
    }

    /**
     * POST /api/auth/login
     * Đăng nhập, nhận JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }
}
