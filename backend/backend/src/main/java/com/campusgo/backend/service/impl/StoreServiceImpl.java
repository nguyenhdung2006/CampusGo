package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.Store;
import com.campusgo.backend.repository.StoreRepository;
import com.campusgo.backend.service.StoreService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;

    public StoreServiceImpl(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    @Override
    public List<Store> getAll() {
        return storeRepository.findAll();
    }

    @Override
    public Store getById(Integer id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
    }

    @Override
    public Store create(Store store) {
        return storeRepository.save(store);
    }

    @Override
    public void delete(Integer id) {
        if (!storeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found");
        }
        storeRepository.deleteById(id);
    }
}