package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.Delivery;
import com.campusgo.backend.entity.Order;
import com.campusgo.backend.entity.OrderStatus;
import com.campusgo.backend.entity.Product;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.OrderRepository;
import com.campusgo.backend.repository.ProductRepository;
import com.campusgo.backend.repository.UserRepository;
import com.campusgo.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            UserRepository userRepository,
                            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    @Override
    public Order getById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Override
    public List<Order> getByUser(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order updateStatus(Integer id, String status) {
        Order order = getById(id);

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            return orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }
    }

    @Override
    public Order cancel(Integer id) {
        Order order = getById(id);
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public Order create(Order order) {
        if (order.getUser() == null || order.getUser().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required");
        }
        if (order.getDeliveryAddress() == null || order.getDeliveryAddress().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery address is required");
        }

        User user = userRepository.findById(order.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        order.setUser(user);

        if (order.getItems() != null) {
            double total = 0;

            for (var item : order.getItems()) {
                item.setOrder(order);

                if (item.getProduct() == null || item.getProduct().getId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each order item must have a product id");
                }
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0");
                }

                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
                item.setProduct(product);

                if (item.getPrice() == null) {
                    item.setPrice(product.getPrice());
                }

                total += item.getPrice() * item.getQuantity();
            }

            if (order.getTotalPrice() == null) {
                order.setTotalPrice(total);
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        if (order.getDelivery() == null) {
            Delivery delivery = new Delivery();
            delivery.setStatus("PENDING");
            delivery.setOrder(order);
            order.setDelivery(delivery);
        }

        return orderRepository.save(order);
    }

    @Override
    public void delete(Integer id) {
        if (!orderRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        orderRepository.deleteById(id);
    }
}
