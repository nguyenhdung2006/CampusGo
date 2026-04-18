package com.campusgo.backend.service;

import com.campusgo.backend.entity.OrderItem;

import java.util.List;

public interface OrderItemService {

    List<OrderItem> getAll();

    OrderItem getById(Integer id);

    OrderItem create(OrderItem item);

    void delete(Integer id);
}