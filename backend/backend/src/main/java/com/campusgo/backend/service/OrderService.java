package com.campusgo.backend.service;

import com.campusgo.backend.entity.Order;
import java.util.List;

public interface OrderService {

    // ===== BASIC =====
    List<Order> getAll();

    Order getById(Integer id);

    Order create(Order order);

    void delete(Integer id);

    // ===== BUSINESS =====

    // lấy đơn theo user
    List<Order> getByUser(Integer userId);

    // update trạng thái đơn
    Order updateStatus(Integer id, String status);

    // huỷ đơn
    Order cancel(Integer id);
}