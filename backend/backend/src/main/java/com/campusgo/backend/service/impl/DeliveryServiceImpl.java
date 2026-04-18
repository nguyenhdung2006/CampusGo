package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.Delivery;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.DeliveryRepository;
import com.campusgo.backend.repository.UserRepository;
import com.campusgo.backend.service.DeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;

    public DeliveryServiceImpl(DeliveryRepository deliveryRepository, UserRepository userRepository) {
        this.deliveryRepository = deliveryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Delivery> getAll() {
        return deliveryRepository.findAll();
    }

    @Override
    public Delivery getById(Integer id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found"));
    }

    @Override
    public Delivery create(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    @Override
    public Delivery updateStatus(Integer id, String status) {
        Delivery delivery = getById(id);
        delivery.setStatus(status);
        return deliveryRepository.save(delivery);
    }

    @Override
    public Delivery assignShipper(Integer id, Integer shipperId) {
        Delivery delivery = getById(id);
        User shipper = userRepository.findById(shipperId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipper not found"));

        delivery.setShipper(shipper);
        return deliveryRepository.save(delivery);
    }

    @Override
    public void delete(Integer id) {
        if (!deliveryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found");
        }
        deliveryRepository.deleteById(id);
    }
}
