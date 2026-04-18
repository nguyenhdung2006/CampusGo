package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.OrderItem;
import com.campusgo.backend.repository.OrderItemRepository;
import com.campusgo.backend.service.OrderItemService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public OrderItemServiceImpl(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public List<OrderItem> getAll() {
        return orderItemRepository.findAll();
    }

    @Override
    public OrderItem getById(Integer id) {
        return orderItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order item not found"));
    }

    @Override
    public OrderItem create(OrderItem item) {
        return orderItemRepository.save(item);
    }

    @Override
    public void delete(Integer id) {
        if (!orderItemRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order item not found");
        }
        orderItemRepository.deleteById(id);
    }
}