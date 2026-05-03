package com.campusgo.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_items")
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false)
    private String phone;

    private String category;

    private String conditionLabel;

    private String pickupLocation;

    private String tradeMethod;

    private Boolean negotiable = false;

    @Column(nullable = false)
    private String status = "AVAILABLE";

    @ManyToOne
    @JoinColumn(name = "seller_id")
    @JsonIgnoreProperties({"orders", "hibernateLazyInitializer", "handler"})
    private User seller;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MarketplaceItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getConditionLabel() { return conditionLabel; }
    public void setConditionLabel(String conditionLabel) { this.conditionLabel = conditionLabel; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getTradeMethod() { return tradeMethod; }
    public void setTradeMethod(String tradeMethod) { this.tradeMethod = tradeMethod; }

    public Boolean getNegotiable() { return negotiable; }
    public void setNegotiable(Boolean negotiable) { this.negotiable = negotiable; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
