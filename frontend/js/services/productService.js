const CATEGORIES = [
    { id: "rice", name: "Cơm" },
    { id: "noodle", name: "Mỳ" },
    { id: "pizza", name: "Pizza" },
    { id: "banh-mi", name: "Bánh mì" },
    { id: "ga-ran", name: "Gà rán" },
    { id: "bun-pho-mien", name: "Bún/Phở/Miến" },
    { id: "com-xoi", name: "Xôi" },
];

const RESTAURANTS = [
    { id: "r1", categoryId: "rice", name: "Cơm Nhà Làm", logoText: "CL", rating: 4.5, ratingCount: 10, purchaseCount: 0, description: "Cơm phần chuẩn vị gia đình, phục vụ nhanh cho sinh viên giờ cao điểm.", address: "Số 12, ngõ KTX A, khuôn viên Campus", image: "./assets/images/com-nha-lam.jpg" },
    { id: "r2", categoryId: "rice", name: "Bếp Sinh Viên", logoText: "BS", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Quán cơm giá mềm, combo tiết kiệm cho bữa trưa và bữa tối.", address: "Tầng 1 nhà ăn B, cạnh thư viện", image: "./assets/images/bep-sinh-vien.jpg" },
    { id: "r7", categoryId: "rice", name: "Cơm Tấm Cổng Tây", logoText: "CT", rating: 4.1, ratingCount: 7, purchaseCount: 0, description: "Cơm tấm sườn bì chả phong cách Sài Gòn.", address: "Cổng Tây khu dịch vụ", image: "./assets/images/com-cong-tay.jpg" },
    { id: "r8", categoryId: "rice", name: "Cơm Gà Campus", logoText: "CG", rating: 4.3, ratingCount: 12, purchaseCount: 0, description: "Cơm gà luộc, gà chiên cho bữa trưa nhanh.", address: "Khu ẩm thực A", image: "./assets/images/com-ga-campus.jpg" },
    { id: "r9", categoryId: "rice", name: "Cơm Văn Phòng Mini", logoText: "CV", rating: 4.0, ratingCount: 5, purchaseCount: 0, description: "Set cơm gọn nhẹ, đủ dinh dưỡng.", address: "Đường nội bộ số 2", image: "./assets/images/com-van-phong.webp" },

    { id: "r3", categoryId: "noodle", name: "Mỳ 1988", logoText: "M8", rating: 4.2, ratingCount: 8, purchaseCount: 0, description: "Chuyên các món mỳ cay, mỳ nước và topping đậm vị kiểu Hàn.", address: "Đường nội bộ số 3, đối diện sân bóng", image: "./assets/images/my-1988.jpg" },
    { id: "r4", categoryId: "noodle", name: "Noodle Corner", logoText: "NC", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Mỳ trộn, mỳ nước và các món ăn nhanh cho buổi tối học nhóm.", address: "Khu dịch vụ C, gần cổng phụ", image: "./assets/images/noodle-corner.jpg" },
    { id: "r10", categoryId: "noodle", name: "Mỳ Cay 7 Cấp", logoText: "M7", rating: 4.4, ratingCount: 20, purchaseCount: 0, description: "Mỳ cay nhiều cấp độ cho team ăn cay.", address: "Phố ẩm thực sinh viên", image: "./assets/images/my-cay-7-cap.png" },
    { id: "r11", categoryId: "noodle", name: "Mỳ Trộn Đêm", logoText: "MT", rating: 4.1, ratingCount: 9, purchaseCount: 0, description: "Mỳ trộn khô đậm vị, mở cửa tối muộn.", address: "Khu KTX B", image: "./assets/images/my-trong-dem.jpg" },
    { id: "r12", categoryId: "noodle", name: "Udon House", logoText: "UH", rating: 4.0, ratingCount: 6, purchaseCount: 0, description: "Mỳ udon nước dùng thanh nhẹ.", address: "Nhà ăn C", image: "./assets/images/udon.jpg" },

    { id: "r5", categoryId: "pizza", name: "Pizza Campus", logoText: "PC", rating: 4.8, ratingCount: 15, purchaseCount: 0, description: "Pizza đế mỏng, nhiều phô mai, phù hợp ăn nhóm trong ký túc xá.", address: "Ki-ốt 05, phố ẩm thực sinh viên", image: "./assets/images/pizza-campus.jpg" },
    { id: "r6", categoryId: "pizza", name: "Lò Nướng Đêm", logoText: "LN", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Mở tối muộn, chuyên pizza và đồ nướng cho ca học đêm.", address: "Góc nhà E, cạnh bãi xe số 2", image: "./assets/images/lo-nuong-dem.jpg" },
    { id: "r13", categoryId: "pizza", name: "Cheese Town", logoText: "CT", rating: 4.5, ratingCount: 14, purchaseCount: 0, description: "Đậm vị phô mai, topping phong phú.", address: "Đối diện thư viện", image: "./assets/images/cheese.webp" },
    { id: "r14", categoryId: "pizza", name: "Pizza Slice", logoText: "PS", rating: 4.2, ratingCount: 8, purchaseCount: 0, description: "Pizza lát tiện cho ăn nhanh.", address: "Cổng phụ phía Đông", image: "./assets/images/slice-pizza.jpg" },
    { id: "r15", categoryId: "pizza", name: "Pizza Nhanh", logoText: "PN", rating: 4.0, ratingCount: 4, purchaseCount: 0, description: "Nướng nhanh, giao nhanh trong campus.", address: "Khu dịch vụ B", image: "./assets/images/fastpizza.jpg" },

    { id: "r16", categoryId: "banh-mi", name: "Bánh Mì Cổng Trường", logoText: "BM", rating: 4.6, ratingCount: 30, purchaseCount: 0, description: "Bánh mì nóng giòn, nhân đầy đặn.", address: "Cổng chính", image: "./assets/images/banh-mi-school.jpg" },
    { id: "r17", categoryId: "banh-mi", name: "Bánh Mì Sáng", logoText: "BS", rating: 4.1, ratingCount: 11, purchaseCount: 0, description: "Phục vụ sáng sớm cho sinh viên.", address: "Khu ký túc xá A", image: "./assets/images/banh-mi-sang.jpg" },
    { id: "r18", categoryId: "banh-mi", name: "Bánh Mì Cô Ba", logoText: "CB", rating: 4.3, ratingCount: 9, purchaseCount: 0, description: "Pate nhà làm, sốt bơ đặc trưng.", address: "Nhà ăn B", image: "./assets/images/banhmicoba.jpg" },
    { id: "r19", categoryId: "banh-mi", name: "Bánh Mì 24/7", logoText: "24", rating: 4.0, ratingCount: 5, purchaseCount: 0, description: "Mở cửa linh hoạt cả ngày.", address: "Gần bãi xe số 1", image: "./assets/images/banhmi24-7.jpg" },
    { id: "r20", categoryId: "banh-mi", name: "Bánh Mì Bếp Nhỏ", logoText: "BN", rating: 4.2, ratingCount: 7, purchaseCount: 0, description: "Bánh mì handmade, vị truyền thống.", address: "Khu dịch vụ C", image: "./assets/images/banh-mi-bep-nho.png" },

    { id: "r21", categoryId: "ga-ran", name: "Gà Rán Giòn", logoText: "GG", rating: 4.4, ratingCount: 16, purchaseCount: 0, description: "Gà giòn rụm, sốt đa dạng.", address: "Phố ẩm thực", image: "./assets/images/KFC.jpg" },
    { id: "r22", categoryId: "ga-ran", name: "Gà Sốt Cay", logoText: "GC", rating: 4.1, ratingCount: 10, purchaseCount: 0, description: "Gà sốt cay kiểu Hàn.", address: "Khu dịch vụ A", image: "./assets/images/Untitled-900x604-1.jpg" },
    { id: "r23", categoryId: "ga-ran", name: "Gà Rán Sinh Viên", logoText: "GS", rating: 4.0, ratingCount: 8, purchaseCount: 0, description: "Giá mềm, combo nhóm.", address: "Cổng ký túc xá B", image: "./assets/images/ga-ran-sv.jpg" },
    { id: "r24", categoryId: "ga-ran", name: "Chicken Box", logoText: "CB", rating: 4.3, ratingCount: 12, purchaseCount: 0, description: "Hộp gà tiện lợi mang đi.", address: "Nhà ăn D", image: "./assets/images/chicken-box.png" },
    { id: "r25", categoryId: "ga-ran", name: "Gà Rán Đêm", logoText: "GD", rating: 4.2, ratingCount: 6, purchaseCount: 0, description: "Mở tới khuya cho ca học đêm.", address: "Gần sân bóng", image: "./assets/images/quan-ga-ran-kfc-gan-day-2.jpg" },

    { id: "r26", categoryId: "bun-pho-mien", name: "Bún Bò Sáng", logoText: "BB", rating: 4.5, ratingCount: 18, purchaseCount: 0, description: "Nước dùng đậm đà, topping đầy đủ.", address: "Cạnh thư viện", image: "./assets/images/bun_bo_ham_cho_bua_sang_19eb2ff3fbea46b7ae44fad89a93baea.jpg" },
    { id: "r27", categoryId: "bun-pho-mien", name: "Phở Campus", logoText: "PC", rating: 4.1, ratingCount: 10, purchaseCount: 0, description: "Phở bò/phở gà chuẩn vị.", address: "Khu nhà ăn A", image: "./assets/images/unipho.jpg" },
    { id: "r28", categoryId: "bun-pho-mien", name: "Miến Gà Nhà", logoText: "MG", rating: 4.0, ratingCount: 7, purchaseCount: 0, description: "Miến gà ta thơm nhẹ.", address: "Cổng phụ", image: "./assets/images/mienganha.jpg" },
    { id: "r29", categoryId: "bun-pho-mien", name: "Bún Riêu Góc Chợ", logoText: "BR", rating: 4.3, ratingCount: 9, purchaseCount: 0, description: "Bún riêu cua kiểu Bắc.", address: "Khu dịch vụ E", image: "./assets/images/hqdefault.jpg" },
    { id: "r30", categoryId: "bun-pho-mien", name: "Phở Bò 24h", logoText: "PB", rating: 4.2, ratingCount: 13, purchaseCount: 0, description: "Phở bò mở từ sáng đến khuya.", address: "Đường nội bộ số 1", image: "./assets/images/pho24.png" },

    { id: "r31", categoryId: "com-xoi", name: "Xôi Cô Lan", logoText: "XL", rating: 4.4, ratingCount: 14, purchaseCount: 0, description: "Xôi mặn truyền thống, topping đa dạng.", address: "Cổng ký túc xá A", image: "./assets/images/maxresdefault.jpg" },
    { id: "r32", categoryId: "com-xoi", name: "Cơm Xôi 2in1", logoText: "CX", rating: 4.1, ratingCount: 8, purchaseCount: 0, description: "Kết hợp cơm và xôi cho bữa no lâu.", address: "Khu nhà ăn C", image: "./assets/images/476312708_1132940675123349_3186001733938464714_n.jpg" },
    { id: "r33", categoryId: "com-xoi", name: "Xôi Mặn Đêm", logoText: "XM", rating: 4.0, ratingCount: 6, purchaseCount: 0, description: "Mở tối muộn, tiện mang đi.", address: "Gần bãi xe số 3", image: "./assets/images/xoi-dem.jpg" },
    { id: "r34", categoryId: "com-xoi", name: "Cơm Xối Mỡ", logoText: "CM", rating: 4.2, ratingCount: 9, purchaseCount: 0, description: "Cơm/xôi kèm gà xối mỡ.", address: "Phố ẩm thực", image: "./assets/images/vn-11134513-7ra0g-m8zqhn5pae7i5b@resize_ss1242x600!@crop_w1242_h600_cT.jpg" },
    { id: "r35", categoryId: "com-xoi", name: "Xôi Gà Góc Nhỏ", logoText: "XG", rating: 4.3, ratingCount: 11, purchaseCount: 0, description: "Xôi gà xé, sốt đặc biệt.", address: "Khu dịch vụ B", image: "./assets/images/cach-nau-xoi-ga-mo-hanh.jpg" },
];

for (const r of RESTAURANTS) {
    r.totalRatingPoints = Number(((r.rating || 0) * (r.ratingCount || 0)).toFixed(1));
}

const productPoolsByCategory = {
    rice: [
        "Cơm gà xối mỡ", "Cơm sườn nướng", "Cơm bò lúc lắc", "Cơm cá kho", "Cơm trứng chiên",
        "Cơm thịt kho", "Cơm gà nướng", "Cơm rang dương châu", "Cơm bò tiêu đen", "Cơm tấm đặc biệt"
    ],
    noodle: [
        "Mỳ bò cay", "Mỳ hải sản", "Mỳ trộn thịt bằm", "Mỳ gà nấm", "Mỳ xào bò",
        "Mỳ ramen", "Mỳ udon bò", "Mỳ nước xương hầm", "Mỳ trộn cay", "Mỳ ý sốt kem"
    ],
    pizza: [
        "Pizza xúc xích", "Pizza phô mai", "Pizza bò bằm", "Pizza hải sản", "Pizza gà sốt cay",
        "Pizza pepperoni", "Pizza nấm", "Pizza BBQ", "Pizza 4 phô mai", "Pizza bò nướng"
    ],
    "banh-mi": [
        "Bánh mì trứng", "Bánh mì thịt nướng", "Bánh mì chả cá", "Bánh mì pate", "Bánh mì gà xé",
        "Bánh mì xíu mại", "Bánh mì xúc xích", "Bánh mì heo quay", "Bánh mì chà bông", "Bánh mì bò sốt"
    ],
    "ga-ran": [
        "Gà rán 2 miếng", "Gà sốt cay", "Combo gà + khoai", "Gà không xương", "Burger gà",
        "Đùi gà giòn", "Cánh gà chiên", "Gà sốt mật ong", "Gà popcorn", "Combo gia đình"
    ],
    "bun-pho-mien": [
        "Bún bò", "Phở bò", "Miến gà", "Bún riêu", "Phở gà",
        "Bún chả", "Miến trộn", "Phở tái nạm", "Bún mọc", "Miến hải sản"
    ],
    "com-xoi": [
        "Xôi gà", "Cơm xôi đặc biệt", "Xôi xéo", "Xôi thịt kho", "Cơm gà xé",
        "Xôi lạp xưởng", "Xôi chả", "Xôi pate", "Cơm tấm sườn", "Xôi đùi gà"
    ],
};

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function priceByCategory(categoryId) {
    switch (categoryId) {
        case "pizza": return rand(89000, 149000);
        case "ga-ran": return rand(39000, 99000);
        case "banh-mi": return rand(18000, 42000);
        case "bun-pho-mien": return rand(30000, 65000);
        case "com-xoi": return rand(25000, 55000);
        default: return rand(28000, 65000); // rice, noodle
    }
}

let pid = 1;
const usedNames = new Set();

const PRODUCTS = RESTAURANTS.flatMap((restaurant) => {
    const pool = productPoolsByCategory[restaurant.categoryId] || [];
    const picked = shuffle(pool).slice(0, 5); // 5 món / quán

    return picked.map((baseName, i) => {
        let name = baseName;
        if (usedNames.has(name)) {
            name = `${baseName} (${restaurant.logoText}-${i + 1})`;
        }
        usedNames.add(name);

        return {
            id: `p${pid++}`,
            restaurantId: restaurant.id,
            name,
            price: priceByCategory(restaurant.categoryId),
        };
    });
});

function delay(ms = 120) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCategories() {
    await delay();
    return CATEGORIES;
}

export async function getRestaurantsByCategory(categoryId) {
    await delay();
    return RESTAURANTS
        .filter((r) => r.categoryId === categoryId)
        .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
}

export async function incrementRestaurantPurchaseCount(restaurantId, amount = 1) {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    if (!restaurant) return Promise.resolve({ success: false });

    restaurant.purchaseCount = (restaurant.purchaseCount || 0) + Math.max(1, amount);

    return Promise.resolve({
        success: true,
        restaurantId,
        purchaseCount: restaurant.purchaseCount,
    });
}

export async function getProductsByRestaurant(restaurantId) {
    await delay();
    return PRODUCTS.filter((p) => p.restaurantId === restaurantId);
}

export async function submitRestaurantRating(restaurantId, stars) {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    if (!restaurant) return { success: false };

    const safeStars = Math.max(1, Math.min(5, Number(stars) || 0));

    restaurant.totalRatingPoints = (restaurant.totalRatingPoints || 0) + safeStars;
    restaurant.ratingCount = (restaurant.ratingCount || 0) + 1;
    restaurant.rating = Number(
        (restaurant.totalRatingPoints / restaurant.ratingCount).toFixed(1)
    );

    return Promise.resolve({
        success: true,
        restaurantId,
        rating: restaurant.rating,
        ratingCount: restaurant.ratingCount,
        totalRatingPoints: restaurant.totalRatingPoints,
    });
}