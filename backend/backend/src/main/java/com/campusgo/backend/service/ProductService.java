package com.campusgo.backend.service;

import com.campusgo.backend.entity.Product;

import java.util.List;

public interface ProductService {
    List<Product> getAll();

    List<Product> getByStore(Integer storeId);

    Product create(Product product);
}
