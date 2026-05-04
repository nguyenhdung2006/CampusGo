package com.campusgo.backend.controller;

import com.campusgo.backend.dto.AuthUserResponse;
import com.campusgo.backend.dto.LoginRequest;
import com.campusgo.backend.dto.PasswordRequest;
import com.campusgo.backend.dto.RegisterRequest;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public AuthUserResponse register(@RequestBody RegisterRequest req, HttpSession session) {
        String email = normalizeEmail(req.getEmail());
        String password = req.getPassword();
        String name = req.getName() == null ? "" : req.getName().trim();

        validateEmail(email);
        validatePassword(password);

        User existing = userRepository.findByEmail(email);
        if (existing != null) {
            boolean hasPassword = existing.getPassword() != null && !existing.getPassword().isBlank();
            String message = hasPassword
                    ? "Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu đã tạo."
                    : "Email này đã từng đăng nhập bằng Google. Hãy vào hồ sơ để tạo mật khẩu.";
            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name.isBlank() ? email.split("@")[0] : name);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");

        User saved = userRepository.save(user);
        session.setAttribute("USER_ID", saved.getId());
        return toResponse(saved);
    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody LoginRequest req, HttpSession session) {
        String email = normalizeEmail(req.getEmail());
        String password = req.getPassword();

        validateEmail(email);
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu không hợp lệ");
        }

        User user = userRepository.findByEmail(email);
        if (user == null || user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai email hoặc mật khẩu");
        }

        session.setAttribute("USER_ID", user.getId());
        return toResponse(user);
    }

    @GetMapping("/me")
    public AuthUserResponse me(HttpSession session) {
        return toResponse(getSessionUser(session));
    }

    @PostMapping("/password")
    public AuthUserResponse updatePassword(@RequestBody PasswordRequest req, HttpSession session) {
        User user = getSessionUser(session);
        String newPassword = req.getNewPassword();

        validatePassword(newPassword);

        boolean alreadyHasPassword = user.getPassword() != null && !user.getPassword().isBlank();
        if (alreadyHasPassword) {
            String currentPassword = req.getCurrentPassword();
            if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private void validateEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không đúng định dạng.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cần ít nhất 6 ký tự.");
        }
    }

    private User getSessionUser(HttpSession session) {
        Object idObj = session.getAttribute("USER_ID");
        if (idObj == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        Integer userId;
        if (idObj instanceof Integer) userId = (Integer) idObj;
        else userId = Integer.valueOf(idObj.toString());

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User không tồn tại"));
    }

    private AuthUserResponse toResponse(User user) {
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), hasPassword);
    }
}
