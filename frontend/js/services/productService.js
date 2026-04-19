const CATEGORIES = [
    { id: "rice", name: "Cơm" },
    { id: "noodle", name: "Mỳ" },
    { id: "pizza", name: "Pizza" },
];

const RESTAURANTS = [
    {
        id: "r1",
        categoryId: "rice",
        name: "Cơm Nhà Làm",
        logoText: "CL",
        rating: 4.5,
        ratingCount: 10,
        description: "Cơm phần chuẩn vị gia đình, phục vụ nhanh cho sinh viên giờ cao điểm.",
        address: "Số 12, ngõ KTX A, khuôn viên Campus",
        image: "./assets/images/com-nha-lam.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    },
    {
        id: "r2",
        categoryId: "rice",
        name: "Bếp Sinh Viên",
        logoText: "BS",
        rating: 0,
        ratingCount: 0,
        description: "Quán cơm giá mềm, combo tiết kiệm cho bữa trưa và bữa tối.",
        address: "Tầng 1 nhà ăn B, cạnh thư viện",
        image: "./assets/images/bep-sinh-vien.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    },
    {
        id: "r3",
        categoryId: "noodle",
        name: "Mỳ 1988",
        logoText: "M8",
        rating: 4.2,
        ratingCount: 8,
        description: "Chuyên các món mỳ cay, mỳ nước và topping đậm vị kiểu Hàn.",
        address: "Đường nội bộ số 3, đối diện sân bóng",
        image: "./assets/images/my-1988.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    },
    {
        id: "r4",
        categoryId: "noodle",
        name: "Noodle Corner",
        logoText: "NC",
        rating: 0,
        ratingCount: 0,
        description: "Mỳ trộn, mỳ nước và các món ăn nhanh cho buổi tối học nhóm.",
        address: "Khu dịch vụ C, gần cổng phụ",
        image: "./assets/images/noodle-corner.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    },
    {
        id: "r5",
        categoryId: "pizza",
        name: "Pizza Campus",
        logoText: "PC",
        rating: 4.8,
        ratingCount: 15,
        description: "Pizza đế mỏng, nhiều phô mai, phù hợp ăn nhóm trong ký túc xá.",
        address: "Ki-ốt 05, phố ẩm thực sinh viên",
        image: "./assets/images/pizza-campus.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    },
    {
        id: "r6",
        categoryId: "pizza",
        name: "Lò Nướng Đêm",
        logoText: "LN",
        rating: 0,
        ratingCount: 0,
        description: "Mở tối muộn, chuyên pizza và đồ nướng cho ca học đêm.",
        address: "Góc nhà E, cạnh bãi xe số 2",
        image: "./assets/images/lo-nuong-dem.jpg" // <-- ĐỔI TÊN ẢNH Ở ĐÂY
    }
    ];
const PRODUCTS = [
    { id: "p1", restaurantId: "r1", name: "Cơm gà xối mỡ", price: 35000 },
    { id: "p2", restaurantId: "r1", name: "Cơm sườn nướng", price: 40000 },
    { id: "p3", restaurantId: "r2", name: "Cơm trứng xúc xích", price: 28000 },
    { id: "p4", restaurantId: "r3", name: "Mỳ bò cay", price: 42000 },
    { id: "p5", restaurantId: "r3", name: "Mỳ hải sản", price: 46000 },
    { id: "p6", restaurantId: "r4", name: "Mỳ trộn thịt bằm", price: 32000 },
    { id: "p7", restaurantId: "r5", name: "Pizza xúc xích", price: 99000 },
    { id: "p8", restaurantId: "r5", name: "Pizza phô mai", price: 109000 },
    { id: "p9", restaurantId: "r6", name: "Pizza bò bằm", price: 119000 },
];

export async function getCategories() {
    return Promise.resolve(CATEGORIES);
}

export async function getRestaurantsByCategory(categoryId) {
    return Promise.resolve(RESTAURANTS.filter((r) => r.categoryId === categoryId));
}

export async function getProductsByRestaurant(restaurantId) {
    return Promise.resolve(PRODUCTS.filter((p) => p.restaurantId === restaurantId));
}

export async function submitRestaurantRating(restaurantId, stars) {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    if (!restaurant) {
        return Promise.resolve({ success: false });
    }

    const oldCount = restaurant.ratingCount || 0;
    const oldRating = restaurant.rating || 0;

    const newCount = oldCount + 1;
    const newRating = (oldRating * oldCount + stars) / newCount;

    restaurant.rating = Number(newRating.toFixed(1));
    restaurant.ratingCount = newCount;

    return Promise.resolve({
        success: true,
        restaurantId,
        rating: restaurant.rating,
        ratingCount: restaurant.ratingCount,
    });
}