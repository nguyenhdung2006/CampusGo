package com.campusgo.backend.repository;

import com.campusgo.backend.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
    List<Delivery> findByShipperIsNullAndStatus(String status);
    List<Delivery> findByShipperId(Integer shipperId);
}