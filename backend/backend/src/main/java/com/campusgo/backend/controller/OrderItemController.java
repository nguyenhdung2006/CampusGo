package com.campusgo.backend.controller;

import com.campusgo.backend.entity.OrderItem;
import com.campusgo.backend.service.OrderItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    // ===== GET ALL =====
    @GetMapping
    public List<OrderItem> getAll() {
        return orderItemService.getAll();
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public OrderItem getById(@PathVariable Integer id) {
        return orderItemService.getById(id);
    }

    // ===== CREATE =====
    @PostMapping
    public OrderItem create(@RequestBody OrderItem item) {
        return orderItemService.create(item);
    }

    // ===== DELETE =====
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        orderItemService.delete(id);
    }
}