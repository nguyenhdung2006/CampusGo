package com.campusgo.backend.controller;

import com.campusgo.backend.entity.Delivery;
import com.campusgo.backend.service.DeliveryService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.campusgo.backend.entity.OrderStatus;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.DeliveryRepository;
import com.campusgo.backend.repository.OrderRepository;
import com.campusgo.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DeliveryController(
            DeliveryService deliveryService,
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository,
            UserRepository userRepository
    ) {
        this.deliveryService = deliveryService;
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    private Integer requireUserId(HttpSession session) {
        Object v = session.getAttribute("USER_ID");
        if (v == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        if (v instanceof Integer) return (Integer) v;
        return Integer.valueOf(v.toString());
    }

    @GetMapping("/mine")
    public List<Delivery> myDeliveries(HttpSession session) {
        Integer shipperUserId = requireUserId(session);

        User shipper = userRepository.findById(shipperUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));

        if (shipper.getRole() == null || !shipper.getRole().equalsIgnoreCase("SHIPPER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ SHIPPER mới xem được delivery của mình");
        }

        return deliveryRepository.findByShipperId(shipperUserId);
    }

    @GetMapping("/available")
    public List<Delivery> availableDeliveries() {
        return deliveryRepository.findByShipperIsNullAndStatus("NOT_ASSIGNED")
                .stream()
                .filter(d -> d.getOrder() != null && d.getOrder().getStatus() == OrderStatus.PACKED)
                .toList();
    }

    @GetMapping
    public List<Delivery> getAll() {
        return deliveryService.getAll();
    }

    @GetMapping("/{id}")
    public Delivery getById(@PathVariable Integer id) {
        return deliveryService.getById(id);
    }

    @PostMapping
    public Delivery create(@RequestBody Delivery delivery) {
        return deliveryService.create(delivery);
    }

    @PutMapping("/{id}/status")
    public Delivery updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return deliveryService.updateStatus(id, status);
    }

    @PutMapping("/{id}/shipper/{shipperId}")
    public Delivery assignShipper(@PathVariable Integer id, @PathVariable Integer shipperId) {
        return deliveryService.assignShipper(id, shipperId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        deliveryService.delete(id);
    }

    @PutMapping("/{id}/claim")
    @Transactional
    public Delivery claim(@PathVariable Integer id, HttpSession session) {
        Integer shipperUserId = requireUserId(session);

        // (optional) check role = SHIPPER nếu bạn có field role trong User
        User shipper = userRepository.findById(shipperUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));

        if (shipper.getRole() == null || !shipper.getRole().equalsIgnoreCase("SHIPPER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ SHIPPER mới được nhận đơn");
        }

        Delivery d = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery không tồn tại"));

        if (d.getShipper() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery đã có shipper nhận");
        }
        if (!"NOT_ASSIGNED".equalsIgnoreCase(d.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery không ở trạng thái NOT_ASSIGNED");
        }
        if (d.getOrder() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery chưa gắn order");
        }
        if (d.getOrder().getStatus() != OrderStatus.PACKED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ claim được khi order đang PACKED");
        }

        d.setShipper(shipper);
        d.setStatus("ASSIGNED");

        // update order -> SHIPPING
        d.getOrder().setStatus(OrderStatus.SHIPPING);
        orderRepository.save(d.getOrder());

        return deliveryRepository.save(d);
    }

    @PutMapping("/{id}/picked-up")
    @Transactional
    public Delivery pickedUp(@PathVariable Integer id, HttpSession session) {
        Integer shipperUserId = requireUserId(session);

        User shipper = userRepository.findById(shipperUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));

        if (shipper.getRole() == null || !shipper.getRole().equalsIgnoreCase("SHIPPER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ SHIPPER mới được cập nhật trạng thái");
        }

        Delivery d = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery không tồn tại"));

        if (d.getShipper() == null || d.getShipper().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery chưa có shipper nhận");
        }
        if (!d.getShipper().getId().equals(shipperUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải shipper của delivery này");
        }
        if (!"ASSIGNED".equalsIgnoreCase(d.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ picked-up được khi delivery đang ASSIGNED");
        }

        d.setStatus("PICKED_UP");
        return deliveryRepository.save(d);
    }

    @PutMapping("/{id}/delivered")
    @Transactional
    public Delivery delivered(@PathVariable Integer id, HttpSession session) {
        Integer shipperUserId = requireUserId(session);

        User shipper = userRepository.findById(shipperUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));

        if (shipper.getRole() == null || !shipper.getRole().equalsIgnoreCase("SHIPPER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ SHIPPER mới được cập nhật trạng thái");
        }

        Delivery d = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery không tồn tại"));

        if (d.getShipper() == null || d.getShipper().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery chưa có shipper nhận");
        }
        if (!d.getShipper().getId().equals(shipperUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải shipper của delivery này");
        }
        if (!"PICKED_UP".equalsIgnoreCase(d.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ delivered được khi delivery đang PICKED_UP");
        }

        d.setStatus("DELIVERED");

        if (d.getOrder() != null) {
            d.getOrder().setStatus(OrderStatus.DONE);
            orderRepository.save(d.getOrder());
        }

        return deliveryRepository.save(d);
    }
}
