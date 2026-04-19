package com.campusgo.backend.dto;

import com.campusgo.backend.entity.Store;

public class StoreResponse {
    private Integer id;
    private String name;
    private String categoryId;
    private String image;
    private String description;
    private String address;
    private Double rating;
    private Integer ratingCount;
    private Integer purchaseCount;

    public static StoreResponse from(Store s) {
        StoreResponse r = new StoreResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setCategoryId(s.getCategoryId());
        r.setImage(s.getImage());
        r.setDescription(s.getDescription());
        r.setAddress(s.getAddress());
        r.setRating(s.getRating());
        r.setRatingCount(s.getRatingCount());
        r.setPurchaseCount(s.getPurchaseCount());
        return r;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }
    public Integer getPurchaseCount() { return purchaseCount; }
    public void setPurchaseCount(Integer purchaseCount) { this.purchaseCount = purchaseCount; }
}