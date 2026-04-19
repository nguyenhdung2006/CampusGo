package com.campusgo.backend.controller;

import com.campusgo.backend.dto.AuthUserResponse;
import com.campusgo.backend.dto.LoginRequest;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody LoginRequest req, HttpSession session) {
        if (req.getEmail() == null || req.getEmail().isBlank() ||
            req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Email/mật khẩu không hợp lệ");
        }

        User user = userRepository.findByEmail(req.getEmail());
        if (user == null || user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai email hoặc mật khẩu");
        }

        session.setAttribute("USER_ID", user.getId());
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    @GetMapping("/me")
    public AuthUserResponse me(HttpSession session) {
        Object idObj = session.getAttribute("USER_ID");
        if (idObj == null) throw new RuntimeException("Chưa đăng nhập");

        Integer userId = (Integer) idObj;
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }
}