package com.campusgo.backend.service;

import com.campusgo.backend.entity.Delivery;

import java.util.List;

public interface DeliveryService {

    List<Delivery> getAll();

    Delivery getById(Integer id);

    Delivery create(Delivery delivery);

    Delivery updateStatus(Integer id, String status);

    Delivery assignShipper(Integer id, Integer shipperId);

    void delete(Integer id);
}
