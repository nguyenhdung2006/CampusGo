package com.campusgo.backend.repository;

import com.campusgo.backend.entity.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    // 👇 Thêm dòng này
    List<MarketplaceItem> findBySellerId(Integer sellerId);
}
