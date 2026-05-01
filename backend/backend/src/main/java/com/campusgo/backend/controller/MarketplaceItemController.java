package com.campusgo.backend.controller;

import com.campusgo.backend.entity.MarketplaceItem;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.UserRepository;
import com.campusgo.backend.service.MarketplaceItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceItemController {

    @Autowired
    private MarketplaceItemService marketplaceItemService;

    @Autowired
    private UserRepository userRepository; // 🚩 Bổ sung phụ thuộc UserRepository

    private Integer getSessionUserId(HttpServletRequest request) {
        Object userIdObj = request.getSession().getAttribute("USER_ID");
        if (userIdObj == null) return null;

        if (userIdObj instanceof Integer) {
            return (Integer) userIdObj;
        }
        if (userIdObj instanceof Long) {
            return ((Long) userIdObj).intValue();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ID user không xác định kiểu!");
    }

    private User getUserById(Integer userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập!");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user!"));
    }

    private User getCurrentUser(HttpServletRequest request) {
        return getUserById(getSessionUserId(request));
    }

    private User resolveSeller(HttpServletRequest request, MarketplaceItem item) {
        Integer sessionUserId = getSessionUserId(request);
        if (sessionUserId != null) {
            return getUserById(sessionUserId);
        }

        Integer sellerId = item != null && item.getSeller() != null ? item.getSeller().getId() : null;
        return getUserById(sellerId);
    }

    // Lấy tất cả sản phẩm (PUBLIC)
    @GetMapping
    public List<MarketplaceItem> getAllItems() {
        return marketplaceItemService.findAll();
    }

    // Lấy thông tin sản phẩm theo id (PUBLIC)
    @GetMapping("/{id}")
    public MarketplaceItem getItem(@PathVariable Long id) {
        return marketplaceItemService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm!"));
    }

    // [MỚI] Lấy sản phẩm của user hiện tại (chỉ đăng nhập mới xem được)
    @GetMapping("/mine")
    public List<MarketplaceItem> getMyItems(@RequestParam(required = false) Integer userId,
                                            HttpServletRequest request) {
        User user = userId != null ? getUserById(userId) : getCurrentUser(request);
        return marketplaceItemService.findBySellerId(user.getId());
    }
    // Đăng sản phẩm mới (BACKEND tự gán seller)
    @PostMapping
    public MarketplaceItem createItem(@RequestBody MarketplaceItem item, HttpServletRequest request) {
        User user = resolveSeller(request, item);
        item.setSeller(user);
        item.setStatus("AVAILABLE");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return marketplaceItemService.save(item);
    }

    // Sửa sản phẩm (chỉ chủ bài mới sửa được)
    @PutMapping("/{id}")
    public MarketplaceItem updateItem(@PathVariable Long id, @RequestBody MarketplaceItem updatedItem, HttpServletRequest request) {
        MarketplaceItem item = marketplaceItemService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm!"));
        User user = resolveSeller(request, updatedItem);
        if (!item.getSeller().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa bài này!");
        }
        // cập nhật trường theo yêu cầu
        item.setTitle(updatedItem.getTitle());
        item.setDescription(updatedItem.getDescription());
        item.setPrice(updatedItem.getPrice());
        item.setImageUrl(updatedItem.getImageUrl());
        item.setPhone(updatedItem.getPhone());
        item.setStatus(updatedItem.getStatus());
        item.setUpdatedAt(LocalDateTime.now());
        return marketplaceItemService.save(item);
    }

    // Xóa sản phẩm (chỉ chủ bài mới xóa được)
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id,
                           @RequestParam(required = false) Integer userId,
                           HttpServletRequest request) {
        MarketplaceItem item = marketplaceItemService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm!"));
        User user = userId != null ? getUserById(userId) : getCurrentUser(request);
        if (!item.getSeller().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xoá bài này!");
        }
        marketplaceItemService.deleteById(id);
    }
}
