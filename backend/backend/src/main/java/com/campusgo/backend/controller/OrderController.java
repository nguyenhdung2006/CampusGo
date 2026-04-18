package com.campusgo.backend.controller;

import com.campusgo.backend.entity.Order;
import com.campusgo.backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")

public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET all
    @GetMapping
    public List<Order> getAll() {
        return orderService.getAll();
    }

    // GET by id
    @GetMapping("/{id}")
    public Order getById(@PathVariable Integer id) {
        return orderService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getByUser(@PathVariable Integer userId) {
        return orderService.getByUser(userId);
    }

    // POST create
    @PostMapping
    public Order create(@RequestBody Order order) {
        return orderService.create(order);
    }

    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(@PathVariable Integer id) {
        return orderService.cancel(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        orderService.delete(id);
    }
}
