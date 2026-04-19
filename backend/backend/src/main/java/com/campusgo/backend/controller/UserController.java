package com.campusgo.backend.controller;

import com.campusgo.backend.entity.User;
import com.campusgo.backend.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserService userService, BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // Giữ tạm endpoint cũ để tương thích demo
    // Nhưng đã thêm check password + encode
    @PostMapping("/login")
    public User login(@RequestBody User userReq) {
        String email = userReq.getEmail();
        String password = userReq.getPassword();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email không hợp lệ");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Mật khẩu không hợp lệ");
        }

        User existing = userService.findByEmail(email);

        // Đã có user -> verify password
        if (existing != null) {
            if (existing.getPassword() == null || !passwordEncoder.matches(password, existing.getPassword())) {
                throw new RuntimeException("Sai email hoặc mật khẩu");
            }
            return existing;
        }

        // Chưa có user -> tạo mới với password đã hash
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(
                userReq.getName() != null && !userReq.getName().isBlank()
                        ? userReq.getName().trim()
                        : email.split("@")[0]
        );
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole("USER");

        return userService.create(newUser);
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Integer id) {
        return userService.getById(id);
    }

    // Tạo user thủ công (admin/seed/demo) -> luôn encode password nếu có
    @PostMapping
    public User create(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email không hợp lệ");
        }

        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(user.getEmail().split("@")[0]);
        }

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            // Nếu bạn muốn bắt buộc password local thì mở dòng dưới:
            // throw new RuntimeException("Mật khẩu không được để trống");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        return userService.create(user);
    }
}