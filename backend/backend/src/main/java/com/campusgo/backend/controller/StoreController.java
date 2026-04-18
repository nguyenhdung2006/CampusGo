package com.campusgo.backend.controller;

import com.campusgo.backend.entity.Store;
import com.campusgo.backend.service.StoreService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public List<Store> getAll() {
        return storeService.getAll();
    }

    @GetMapping("/{id}")
    public Store getById(@PathVariable Integer id) {
        return storeService.getById(id);
    }

    @PostMapping
    public Store create(@RequestBody Store store) {
        return storeService.create(store);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        storeService.delete(id);
    }
}