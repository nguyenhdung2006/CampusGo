package com.campusgo.backend.service.impl;

import com.campusgo.backend.entity.MarketplaceItem;
import com.campusgo.backend.repository.MarketplaceItemRepository;
import com.campusgo.backend.service.MarketplaceItemService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceItemServiceImpl implements MarketplaceItemService {
    private final MarketplaceItemRepository marketplaceItemRepository;

    public MarketplaceItemServiceImpl(MarketplaceItemRepository marketplaceItemRepository) {
        this.marketplaceItemRepository = marketplaceItemRepository;
    }

    @Override
    public List<MarketplaceItem> findAll() {
        return marketplaceItemRepository.findAll();
    }

    @Override
    public Optional<MarketplaceItem> findById(Long id) {
        return marketplaceItemRepository.findById(id);
    }

    @Override
    public MarketplaceItem save(MarketplaceItem item) {
        return marketplaceItemRepository.save(item);
    }

    @Override
    public void deleteById(Long id) {
        marketplaceItemRepository.deleteById(id);
    }

    @Override
    public List<MarketplaceItem> findBySellerId(Integer sellerId) {
        return marketplaceItemRepository.findBySellerId(sellerId);
    }
}
