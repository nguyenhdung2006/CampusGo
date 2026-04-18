package com.campusgo.backend.controller;

import com.campusgo.backend.entity.User;
import com.campusgo.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public User login(@RequestBody User userReq) {

        String email = userReq.getEmail();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email không hợp lệ");
        }

        User user = userService.findByEmail(email);

        if (user != null) {
            return user;
        }

        User newUser = new User();
        newUser.setEmail(email);

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

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.create(user);
    }
}
