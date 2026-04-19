const CATEGORIES = [
    { id: "rice", name: "Cơm" },
    { id: "noodle", name: "Mỳ" },
    { id: "pizza", name: "Pizza" },
];

const RESTAURANTS = [
    { id: "r1", categoryId: "rice", name: "Cơm Nhà Làm", logoText: "CL", rating: 4.5 },
    { id: "r2", categoryId: "rice", name: "Bếp Sinh Viên", logoText: "BS", rating: 0 },
    { id: "r3", categoryId: "noodle", name: "Mỳ 1988", logoText: "M8", rating: 4.2 },
    { id: "r4", categoryId: "noodle", name: "Noodle Corner", logoText: "NC", rating: 0 },
    { id: "r5", categoryId: "pizza", name: "Pizza Campus", logoText: "PC", rating: 4.8 },
    { id: "r6", categoryId: "pizza", name: "Lò Nướng Đêm", logoText: "LN", rating: 0 },
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