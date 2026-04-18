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

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
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
}
