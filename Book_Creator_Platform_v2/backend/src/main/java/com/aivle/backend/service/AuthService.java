package com.aivle.backend.service;

import com.aivle.backend.config.JwtUtil;
import com.aivle.backend.entity.User;
import com.aivle.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public void register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role("USER")
                .build();
        userRepository.save(user);
    }

    public Map<String, String> login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 틀렸습니다."));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("아이디 또는 비밀번호가 틀렸습니다.");
        }
        String token = jwtUtil.generateToken(username, user.getRole());
        return Map.of("token", token, "role", user.getRole());
    }
}