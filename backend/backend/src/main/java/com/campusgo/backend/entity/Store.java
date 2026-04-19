package com.campusgo.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.util.List;

@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String address;

    private String phone;

    // ===== thêm để map với frontend filter =====
    @Column(name = "category_id", length = 50)
    private String categoryId;

    // ===== metadata hiển thị =====
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ===== thống kê toàn hệ thống =====
    @Column(name = "purchase_count")
    private Integer purchaseCount;

    @Column(name = "rating_count")
    private Integer ratingCount;

    @Column(name = "total_rating_points")
    private Integer totalRatingPoints;

    // lưu điểm trung bình (vd: 4.5)
    private Double rating;

    @OneToMany(mappedBy = "store")
    @JsonIgnoreProperties("store")
    private List<Product> products;

    @PrePersist
    public void prePersist() {
        if (purchaseCount == null) purchaseCount = 0;
        if (ratingCount == null) ratingCount = 0;
        if (totalRatingPoints == null) totalRatingPoints = 0;
        if (rating == null) rating = 0.0;
    }

    // ===== getters/setters =====
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPurchaseCount() {
        return purchaseCount;
    }

    public void setPurchaseCount(Integer purchaseCount) {
        this.purchaseCount = purchaseCount;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Integer getTotalRatingPoints() {
        return totalRatingPoints;
    }

    public void setTotalRatingPoints(Integer totalRatingPoints) {
        this.totalRatingPoints = totalRatingPoints;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}