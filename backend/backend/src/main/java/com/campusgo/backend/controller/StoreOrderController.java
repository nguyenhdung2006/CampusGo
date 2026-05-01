package com.campusgo.backend.controller;

import com.campusgo.backend.entity.Order;
import com.campusgo.backend.entity.OrderStatus;
import com.campusgo.backend.entity.Store;
import com.campusgo.backend.repository.OrderRepository;
import com.campusgo.backend.repository.StoreRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/store")
public class StoreOrderController {

    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;

    public StoreOrderController(StoreRepository storeRepository, OrderRepository orderRepository) {
        this.storeRepository = storeRepository;
        this.orderRepository = orderRepository;
    }

    private Integer requireUserId(HttpSession session) {
        Object v = session.getAttribute("USER_ID");
        if (v == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        if (v instanceof Integer) return (Integer) v;
        return Integer.valueOf(v.toString());
    }

    @GetMapping("/orders")
    public List<Order> myStoreOrders(@RequestParam(required = false) String status, HttpSession session) {
        Integer userId = requireUserId(session);

        Store store = storeRepository.findByOwnerId(userId);
        if (store == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản này chưa được gán cửa hàng");
        }

        if (status == null || status.isBlank()) {
            return orderRepository.findByStoreId(store.getId());
        }

        OrderStatus st;
        try {
            st = OrderStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status không hợp lệ: " + status);
        }

        return orderRepository.findByStoreIdAndStatus(store.getId(), st);
    }

    @PutMapping("/orders/{orderId}/confirm")
    public Order confirm(@PathVariable Integer orderId, HttpSession session) {
        Integer userId = requireUserId(session);

        Store store = storeRepository.findByOwnerId(userId);
        if (store == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản này chưa được gán cửa hàng");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        if (order.getStore() == null || order.getStore().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order chưa có store");
        }
        if (!order.getStore().getId().equals(store.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order không thuộc cửa hàng của bạn");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ confirm được order PENDING");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

        @PutMapping("/orders/{orderId}/processing")
    public Order processing(@PathVariable Integer orderId, HttpSession session) {
        Integer userId = requireUserId(session);

        Store store = storeRepository.findByOwnerId(userId);
        if (store == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản này chưa được gán cửa hàng");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        if (order.getStore() == null || order.getStore().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order chưa có store");
        }
        if (!order.getStore().getId().equals(store.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order không thuộc cửa hàng của bạn");
        }

        // NEW RULE: chỉ từ CONFIRMED -> PROCESSING
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chuyển PROCESSING được khi order đang CONFIRMED");
        }

        order.setStatus(OrderStatus.PROCESSING);
        return orderRepository.save(order);
    }

        @PutMapping("/orders/{orderId}/packed")
    public Order packed(@PathVariable Integer orderId, HttpSession session) {
        Integer userId = requireUserId(session);

        Store store = storeRepository.findByOwnerId(userId);
        if (store == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản này chưa được gán cửa hàng");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        if (order.getStore() == null || order.getStore().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order chưa có store");
        }
        if (!order.getStore().getId().equals(store.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order không thuộc cửa hàng của bạn");
        }

        // NEW RULE: chỉ từ PROCESSING -> PACKED
        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chuyển PACKED được khi order đang PROCESSING");
        }

        order.setStatus(OrderStatus.PACKED);
        return orderRepository.save(order);
    }
}