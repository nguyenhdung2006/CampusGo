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
        return storeRepository.findAllByOrderByPurchaseCountDesc();
    }

    @Override
    public List<Store> getByCategory(String categoryId) {
        if (categoryId == null || categoryId.isBlank()) {
            return getAll();
        }
        return storeRepository.findByCategoryIdOrderByPurchaseCountDesc(categoryId);
    }

    @Override
    public Store getById(Integer id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
    }

    @Override
    public Store create(Store store) {
        if (store.getPurchaseCount() == null) store.setPurchaseCount(0);
        if (store.getRatingCount() == null) store.setRatingCount(0);
        if (store.getTotalRatingPoints() == null) store.setTotalRatingPoints(0);
        if (store.getRating() == null) store.setRating(0.0);
        return storeRepository.save(store);
    }

    @Override
    public Store incrementPurchaseCount(Integer id, Integer amount) {
        Store store = getById(id);

        int safeAmount = (amount == null || amount < 1) ? 1 : amount;
        int current = store.getPurchaseCount() == null ? 0 : store.getPurchaseCount();

        store.setPurchaseCount(current + safeAmount);
        return storeRepository.save(store);
    }

    @Override
    public Store submitRating(Integer id, Integer stars) {
        Store store = getById(id);

        int safeStars = (stars == null) ? 0 : stars;
        if (safeStars < 1) safeStars = 1;
        if (safeStars > 5) safeStars = 5;

        int currentCount = store.getRatingCount() == null ? 0 : store.getRatingCount();
        int currentPoints = store.getTotalRatingPoints() == null ? 0 : store.getTotalRatingPoints();

        int newCount = currentCount + 1;
        int newPoints = currentPoints + safeStars;

        double avg = (double) newPoints / newCount;
        // làm tròn 1 chữ số thập phân
        double rounded = Math.round(avg * 10.0) / 10.0;

        store.setRatingCount(newCount);
        store.setTotalRatingPoints(newPoints);
        store.setRating(rounded);

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