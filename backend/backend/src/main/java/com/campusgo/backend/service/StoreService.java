package com.campusgo.backend.service;

import com.campusgo.backend.entity.Store;

import java.util.List;

public interface StoreService {

    List<Store> getAll();

    Store getById(Integer id);

    Store create(Store store);

    void delete(Integer id);
}