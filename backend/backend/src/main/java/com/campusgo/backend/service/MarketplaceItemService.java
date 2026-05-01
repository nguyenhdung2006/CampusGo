package com.campusgo.backend.service;

import com.campusgo.backend.entity.MarketplaceItem;
import java.util.List;
import java.util.Optional;

public interface MarketplaceItemService {
    List<MarketplaceItem> findAll();
    Optional<MarketplaceItem> findById(Long id);
    MarketplaceItem save(MarketplaceItem item);
    void deleteById(Long id);

    // Có thể bổ sung các hàm: findBySeller, updateStatus... sau
    // Thêm vào interface MarketplaceItemService:
    List<MarketplaceItem> findBySellerId(Integer sellerId);
}
