package com.example.milkteagame.auth;

import com.example.milkteagame.auth.dto.LoginRequest;
import com.example.milkteagame.auth.dto.LoginResponse;
import com.example.milkteagame.auth.dto.RegisterRequest;
import com.example.milkteagame.config.JwtTokenProvider;
import com.example.milkteagame.user.User;
import com.example.milkteagame.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Xử lý nghiệp vụ đăng ký và đăng nhập.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Đăng ký tài khoản mới.
     * Kiểm tra trùng username/email, mã hóa mật khẩu BCrypt, lưu DB.
     */
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' đã được sử dụng");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
    }

    /**
     * Đăng nhập và phát hành JWT.
     */
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = jwtTokenProvider.generateToken(request.getUsername());
        return new LoginResponse(token);
    }
}
