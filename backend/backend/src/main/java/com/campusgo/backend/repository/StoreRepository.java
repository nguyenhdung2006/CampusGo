package com.campusgo.backend.repository;

import com.campusgo.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Integer> {

    List<Store> findByCategoryIdOrderByPurchaseCountDesc(String categoryId);

    List<Store> findAllByOrderByPurchaseCountDesc();
}