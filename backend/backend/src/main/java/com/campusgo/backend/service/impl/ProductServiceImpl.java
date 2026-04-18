package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.Product;
import com.campusgo.backend.entity.Store;
import com.campusgo.backend.repository.ProductRepository;
import com.campusgo.backend.repository.StoreRepository;
import com.campusgo.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    public ProductServiceImpl(ProductRepository productRepository, StoreRepository storeRepository) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
    }

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getByStore(Integer storeId) {
        return productRepository.findByStoreId(storeId);
    }

    @Override
    public Product create(Product product) {
        if (product.getStore() == null || product.getStore().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store is required");
        }

        Store store = storeRepository.findById(product.getStore().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));

        product.setStore(store);
        return productRepository.save(product);
    }
}
