package com.campusgo.backend.controller;

import com.campusgo.backend.dto.StoreResponse;
import com.campusgo.backend.entity.Store;
import com.campusgo.backend.service.StoreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<StoreResponse> getAllOrByCategory(@RequestParam(required = false) String categoryId) {
        List<Store> stores = (categoryId == null || categoryId.isBlank())
                ? storeService.getAll()
                : storeService.getByCategory(categoryId);

        return stores.stream().map(StoreResponse::from).toList();
    }

    @GetMapping("/{id}")
    public StoreResponse getById(@PathVariable Integer id) {
        return StoreResponse.from(storeService.getById(id));
    }

    @PostMapping
    public StoreResponse create(@RequestBody Store store) {
        return StoreResponse.from(storeService.create(store));
    }

    @PostMapping("/{id}/purchase")
    public StoreResponse incrementPurchase(@PathVariable Integer id,
                                           @RequestParam(defaultValue = "1") Integer amount) {
        return StoreResponse.from(storeService.incrementPurchaseCount(id, amount));
    }

    @PostMapping("/{id}/rating")
    public StoreResponse submitRating(@PathVariable Integer id,
                                      @RequestParam Integer stars) {
        return StoreResponse.from(storeService.submitRating(id, stars));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        storeService.delete(id);
    }
}