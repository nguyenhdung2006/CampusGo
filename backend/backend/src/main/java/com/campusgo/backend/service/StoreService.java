package com.campusgo.backend.service;

import com.campusgo.backend.entity.Store;

import java.util.List;

public interface StoreService {

    List<Store> getAll();

    List<Store> getByCategory(String categoryId);

    Store getById(Integer id);

    Store create(Store store);

    Store incrementPurchaseCount(Integer storeId, Integer amount);

    Store submitRating(Integer storeId, Integer stars);

    void delete(Integer id);
}