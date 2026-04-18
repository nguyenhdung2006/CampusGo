package com.campusgo.backend.service;

import com.campusgo.backend.entity.User;
import java.util.List;

public interface UserService {

    List<User> getAll();

    User findByEmail(String email);

    User getById(Integer id);

    User create(User user);

    void delete(Integer id);
}