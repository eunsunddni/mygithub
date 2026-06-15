package com.aivle.backend.controller;

import com.aivle.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> body) {
        authService.register(body.get("username"), body.get("password"));
        return Map.of("message", "회원가입 성공");
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        return authService.login(body.get("username"), body.get("password"));
    }
}