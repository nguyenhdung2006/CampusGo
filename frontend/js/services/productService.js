import { apiGet } from "../config/api.js";

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
    { id: "r1", categoryId: "rice", name: "Cơm Nhà Làm", logoText: "CL", rating: 4.5, ratingCount: 10, purchaseCount: 0, description: "Cơm phần chuẩn vị gia đình, phục vụ nhanh cho sinh viên giờ cao điểm.", address: "Số 12, ngõ KTX A, khuôn viên Campus", image: "/frontend/assets/images/com-nha-lam.jpg" },
    { id: "r2", categoryId: "rice", name: "Bếp Sinh Viên", logoText: "BS", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Quán cơm giá mềm, combo tiết kiệm cho bữa trưa và bữa tối.", address: "Tầng 1 nhà ăn B, cạnh thư viện", image: "/frontend/assets/images/bep-sinh-vien.jpg" },
    { id: "r7", categoryId: "rice", name: "Cơm Tấm Cổng Tây", logoText: "CT", rating: 4.1, ratingCount: 7, purchaseCount: 0, description: "Cơm tấm sườn bì chả phong cách Sài Gòn.", address: "Cổng Tây khu dịch vụ", image: "/frontend/assets/images/com-cong-tay.jpg" },
    { id: "r8", categoryId: "rice", name: "Cơm Gà Campus", logoText: "CG", rating: 4.3, ratingCount: 12, purchaseCount: 0, description: "Cơm gà luộc, gà chiên cho bữa trưa nhanh.", address: "Khu ẩm thực A", image: "/frontend/assets/images/com-ga-campus.jpg" },
    { id: "r9", categoryId: "rice", name: "Cơm Văn Phòng Mini", logoText: "CV", rating: 4.0, ratingCount: 5, purchaseCount: 0, description: "Set cơm gọn nhẹ, đủ dinh dưỡng.", address: "Đường nội bộ số 2", image: "/frontend/assets/images/com-van-phong.webp" },

    { id: "r3", categoryId: "noodle", name: "Mỳ 1988", logoText: "M8", rating: 4.2, ratingCount: 8, purchaseCount: 0, description: "Chuyên các món mỳ cay, mỳ nước và topping đậm vị kiểu Hàn.", address: "Đường nội bộ số 3, đối diện sân bóng", image: "/frontend/assets/images/my-1988.jpg" },
    { id: "r4", categoryId: "noodle", name: "Noodle Corner", logoText: "NC", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Mỳ trộn, mỳ nước và các món ăn nhanh cho buổi tối học nhóm.", address: "Khu dịch vụ C, gần cổng phụ", image: "/frontend/assets/images/noodle-corner.jpg" },
    { id: "r10", categoryId: "noodle", name: "Mỳ Cay 7 Cấp", logoText: "M7", rating: 4.4, ratingCount: 20, purchaseCount: 0, description: "Mỳ cay nhiều cấp độ cho team ăn cay.", address: "Phố ẩm thực sinh viên", image: "/frontend/assets/images/my-cay-7-cap.png" },
    { id: "r11", categoryId: "noodle", name: "Mỳ Trộn Đêm", logoText: "MT", rating: 4.1, ratingCount: 9, purchaseCount: 0, description: "Mỳ trộn khô đậm vị, mở cửa tối muộn.", address: "Khu KTX B", image: "/frontend/assets/images/my-trong-dem.jpg" },
    { id: "r12", categoryId: "noodle", name: "Udon House", logoText: "UH", rating: 4.0, ratingCount: 6, purchaseCount: 0, description: "Mỳ udon nước dùng thanh nhẹ.", address: "Nhà ăn C", image: "/frontend/assets/images/udon.jpg" },

    { id: "r5", categoryId: "pizza", name: "Pizza Campus", logoText: "PC", rating: 4.8, ratingCount: 15, purchaseCount: 0, description: "Pizza đế mỏng, nhiều phô mai, phù hợp ăn nhóm trong ký túc xá.", address: "Ki-ốt 05, phố ẩm thực sinh viên", image: "/frontend/assets/images/pizza-campus.jpg" },
    { id: "r6", categoryId: "pizza", name: "Lò Nướng Đêm", logoText: "LN", rating: 0, ratingCount: 0, purchaseCount: 0, description: "Mở tối muộn, chuyên pizza và đồ nướng cho ca học đêm.", address: "Góc nhà E, cạnh bãi xe số 2", image: "/frontend/assets/images/lo-nuong-dem.jpg" },
    { id: "r13", categoryId: "pizza", name: "Cheese Town", logoText: "CT", rating: 4.5, ratingCount: 14, purchaseCount: 0, description: "Đậm vị phô mai, topping phong phú.", address: "Đối diện thư viện", image: "/frontend/assets/images/cheese.webp" },
    { id: "r14", categoryId: "pizza", name: "Pizza Slice", logoText: "PS", rating: 4.2, ratingCount: 8, purchaseCount: 0, description: "Pizza lát tiện cho ăn nhanh.", address: "Cổng phụ phía Đông", image: "/frontend/assets/images/slice-pizza.jpg" },
    { id: "r15", categoryId: "pizza", name: "Pizza Nhanh", logoText: "PN", rating: 4.0, ratingCount: 4, purchaseCount: 0, description: "Nướng nhanh, giao nhanh trong campus.", address: "Khu dịch vụ B", image: "/frontend/assets/images/fastpizza.jpg" },

    { id: "r16", categoryId: "banh-mi", name: "Bánh Mì Cổng Trường", logoText: "BM", rating: 4.6, ratingCount: 30, purchaseCount: 0, description: "Bánh mì nóng giòn, nhân đầy đặn.", address: "Cổng chính", image: "/frontend/assets/images/banh-mi-school.jpg" },
    { id: "r17", categoryId: "banh-mi", name: "Bánh Mì Sáng", logoText: "BS", rating: 4.1, ratingCount: 11, purchaseCount: 0, description: "Phục vụ sáng sớm cho sinh viên.", address: "Khu ký túc xá A", image: "/frontend/assets/images/banh-mi-sang.jpg" },
    { id: "r18", categoryId: "banh-mi", name: "Bánh Mì Cô Ba", logoText: "CB", rating: 4.3, ratingCount: 9, purchaseCount: 0, description: "Pate nhà làm, sốt bơ đặc trưng.", address: "Nhà ăn B", image: "/frontend/assets/images/banhmicoba.jpg" },
    { id: "r19", categoryId: "banh-mi", name: "Bánh Mì 24/7", logoText: "24", rating: 4.0, ratingCount: 5, purchaseCount: 0, description: "Mở cửa linh hoạt cả ngày.", address: "Gần bãi xe số 1", image: "/frontend/assets/images/banhmi24-7.jpg" },
    { id: "r20", categoryId: "banh-mi", name: "Bánh Mì Bếp Nhỏ", logoText: "BN", rating: 4.2, ratingCount: 7, purchaseCount: 0, description: "Bánh mì handmade, vị truyền thống.", address: "Khu dịch vụ C", image: "/frontend/assets/images/banh-mi-bep-nho.png" },

    { id: "r21", categoryId: "ga-ran", name: "Gà Rán Giòn", logoText: "GG", rating: 4.4, ratingCount: 16, purchaseCount: 0, description: "Gà giòn rụm, sốt đa dạng.", address: "Phố ẩm thực", image: "/frontend/assets/images/KFC.jpg" },
    { id: "r22", categoryId: "ga-ran", name: "Gà Sốt Cay", logoText: "GC", rating: 4.1, ratingCount: 10, purchaseCount: 0, description: "Gà sốt cay kiểu Hàn.", address: "Khu dịch vụ A", image: "/frontend/assets/images/Untitled-900x604-1.jpg" },
    { id: "r23", categoryId: "ga-ran", name: "Gà Rán Sinh Viên", logoText: "GS", rating: 4.0, ratingCount: 8, purchaseCount: 0, description: "Giá mềm, combo nhóm.", address: "Cổng ký túc xá B", image: "/frontend/assets/images/ga-ran-sv.jpg" },
    { id: "r24", categoryId: "ga-ran", name: "Chicken Box", logoText: "CB", rating: 4.3, ratingCount: 12, purchaseCount: 0, description: "Hộp gà tiện lợi mang đi.", address: "Nhà ăn D", image: "/frontend/assets/images/chicken-box.png" },
    { id: "r25", categoryId: "ga-ran", name: "Gà Rán Đêm", logoText: "GD", rating: 4.2, ratingCount: 6, purchaseCount: 0, description: "Mở tới khuya cho ca học đêm.", address: "Gần sân bóng", image: "/frontend/assets/images/quan-ga-ran-kfc-gan-day-2.jpg" },

    { id: "r26", categoryId: "bun-pho-mien", name: "Bún Bò Sáng", logoText: "BB", rating: 4.5, ratingCount: 18, purchaseCount: 0, description: "Nước dùng đậm đà, topping đầy đủ.", address: "Cạnh thư viện", image: "/frontend/assets/images/bun_bo_ham_cho_bua_sang_19eb2ff3fbea46b7ae44fad89a93baea.jpg" },
    { id: "r27", categoryId: "bun-pho-mien", name: "Phở Campus", logoText: "PC", rating: 4.1, ratingCount: 10, purchaseCount: 0, description: "Phở bò/phở gà chuẩn vị.", address: "Khu nhà ăn A", image: "/frontend/assets/images/unipho.jpg" },
    { id: "r28", categoryId: "bun-pho-mien", name: "Miến Gà Nhà", logoText: "MG", rating: 4.0, ratingCount: 7, purchaseCount: 0, description: "Miến gà ta thơm nhẹ.", address: "Cổng phụ", image: "/frontend/assets/images/mienganha.jpg" },
    { id: "r29", categoryId: "bun-pho-mien", name: "Bún Riêu Góc Chợ", logoText: "BR", rating: 4.3, ratingCount: 9, purchaseCount: 0, description: "Bún riêu cua kiểu Bắc.", address: "Khu dịch vụ E", image: "/frontend/assets/images/hqdefault.jpg" },
    { id: "r30", categoryId: "bun-pho-mien", name: "Phở Bò 24h", logoText: "PB", rating: 4.2, ratingCount: 13, purchaseCount: 0, description: "Phở bò mở từ sáng đến khuya.", address: "Đường nội bộ số 1", image: "/frontend/assets/images/pho24.png" },

    { id: "r31", categoryId: "com-xoi", name: "Xôi Cô Lan", logoText: "XL", rating: 4.4, ratingCount: 14, purchaseCount: 0, description: "Xôi mặn truyền thống, topping đa dạng.", address: "Cổng ký túc xá A", image: "/frontend/assets/images/maxresdefault.jpg" },
    { id: "r32", categoryId: "com-xoi", name: "Cơm Xôi 2in1", logoText: "CX", rating: 4.1, ratingCount: 8, purchaseCount: 0, description: "Kết hợp cơm và xôi cho bữa no lâu.", address: "Khu nhà ăn C", image: "/frontend/assets/images/476312708_1132940675123349_3186001733938464714_n.jpg" },
    { id: "r33", categoryId: "com-xoi", name: "Xôi Mặn Đêm", logoText: "XM", rating: 4.0, ratingCount: 6, purchaseCount: 0, description: "Mở tối muộn, tiện mang đi.", address: "Gần bãi xe số 3", image: "/frontend/assets/images/xoi-dem.jpg" },
    { id: "r34", categoryId: "com-xoi", name: "Cơm Xối Mỡ", logoText: "CM", rating: 4.2, ratingCount: 9, purchaseCount: 0, description: "Cơm/xôi kèm gà xối mỡ.", address: "Phố ẩm thực", image: "/frontend/assets/images/vn-11134513-7ra0g-m8zqhn5pae7i5b@resize_ss1242x600!@crop_w1242_h600_cT.jpg" },
    { id: "r35", categoryId: "com-xoi", name: "Xôi Gà Góc Nhỏ", logoText: "XG", rating: 4.3, ratingCount: 11, purchaseCount: 0, description: "Xôi gà xé, sốt đặc biệt.", address: "Khu dịch vụ B", image: "/frontend/assets/images/cach-nau-xoi-ga-mo-hanh.jpg" },
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

const PREP_TIME_BY_CATEGORY = {
    rice: [8, 15],
    noodle: [7, 14],
    pizza: [13, 24],
    "banh-mi": [3, 9],
    "ga-ran": [10, 18],
    "bun-pho-mien": [6, 13],
    "com-xoi": [5, 12],
    default: [7, 15],
};

const ASSET_IMAGE_PATHS = [
    "/frontend/assets/images/476312708_1132940675123349_3186001733938464714_n.jpg",
    "/frontend/assets/images/banh-mi-bep-nho.png",
    "/frontend/assets/images/banh-mi-sang.jpg",
    "/frontend/assets/images/banh-mi-school.jpg",
    "/frontend/assets/images/banhmi24-7.jpg",
    "/frontend/assets/images/banhmicoba.jpg",
    "/frontend/assets/images/bep-sinh-vien.jpg",
    "/frontend/assets/images/bun_bo_ham_cho_bua_sang_19eb2ff3fbea46b7ae44fad89a93baea.jpg",
    "/frontend/assets/images/cach-nau-xoi-ga-mo-hanh.jpg",
    "/frontend/assets/images/cheese.webp",
    "/frontend/assets/images/chicken-box.png",
    "/frontend/assets/images/com-cong-tay.jpg",
    "/frontend/assets/images/com-ga-campus.jpg",
    "/frontend/assets/images/com-nha-lam.jpg",
    "/frontend/assets/images/com-van-phong.webp",
    "/frontend/assets/images/fastpizza.jpg",
    "/frontend/assets/images/ga-ran-sv.jpg",
    "/frontend/assets/images/hqdefault.jpg",
    "/frontend/assets/images/KFC.jpg",
    "/frontend/assets/images/lo-nuong-dem.jpg",
    "/frontend/assets/images/maxresdefault.jpg",
    "/frontend/assets/images/mienganha.jpg",
    "/frontend/assets/images/my-1988.jpg",
    "/frontend/assets/images/my-cay-7-cap.png",
    "/frontend/assets/images/my-trong-dem.jpg",
    "/frontend/assets/images/noodle-corner.jpg",
    "/frontend/assets/images/pho24.png",
    "/frontend/assets/images/pizza-campus.jpg",
    "/frontend/assets/images/quan-ga-ran-kfc-gan-day-2.jpg",
    "/frontend/assets/images/slice-pizza.jpg",
    "/frontend/assets/images/udon.jpg",
    "/frontend/assets/images/unipho.jpg",
    "/frontend/assets/images/Untitled-900x604-1.jpg",
    "/frontend/assets/images/vn-11134513-7ra0g-m8zqhn5pae7i5b@resize_ss1242x600!@crop_w1242_h600_cT.jpg",
    "/frontend/assets/images/xoi-dem.jpg",
];

function normalizeImagePath(path) {
    if (!path) return "";
    if (path.startsWith("./assets/")) return `/frontend/${path.replace("./", "")}`;
    return path;
}

function imageKey(path) {
    return normalizeImagePath(path).replace(/^\/frontend\//, "").toLowerCase();
}

const RESTAURANT_IMAGE_KEYS = new Set(RESTAURANTS.map((restaurant) => imageKey(restaurant.image)).filter(Boolean));

function isRestaurantImage(path) {
    return RESTAURANT_IMAGE_KEYS.has(imageKey(path));
}

function slugify(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(/\([^)]*\)/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function filenameSlug(path) {
    const filename = imageKey(path).split("/").pop() || "";
    return slugify(filename.replace(/\.[^.]+$/, ""));
}

function getNamedImageCandidates(productName) {
    const slug = slugify(productName);
    if (!slug) return [];

    return ["jpg", "png", "webp", "jpeg"].flatMap((ext) => [
        `/frontend/assets/images/${slug}.${ext}`,
        `/frontend/assets/images/${slug.replaceAll("-", "_")}.${ext}`,
    ]);
}

function getProductInitials(productName = "") {
    const words = slugify(productName).split("-").filter(Boolean);
    const initials = words.slice(0, 2).map((word) => word[0]).join("");
    return (initials || "CG").toUpperCase();
}

function getCategoryIcon(categoryId) {
    switch (categoryId) {
        case "rice": return "COM";
        case "noodle": return "MY";
        case "pizza": return "PIZ";
        case "banh-mi": return "BANH";
        case "ga-ran": return "GA";
        case "bun-pho-mien": return "PHO";
        case "com-xoi": return "XOI";
        default: return "MON";
    }
}

function makeFoodPlaceholderImage(productName, categoryId, seed) {
    const palettes = [
        ["#fff4d6", "#53a6a6", "#c55b32"],
        ["#f8efe2", "#145049", "#f0b44d"],
        ["#ffe8dd", "#9a3f21", "#77b6a6"],
        ["#eef4f1", "#35635f", "#d8874a"],
        ["#fff8ec", "#8f5b2f", "#5eb1bf"],
        ["#f3eee5", "#6f4e37", "#d8a23a"],
    ];
    const [bg, primary, accent] = palettes[seed % palettes.length];
    const initials = getProductInitials(productName);
    const category = getCategoryIcon(categoryId);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
            <rect width="360" height="360" rx="42" fill="${bg}"/>
            <circle cx="292" cy="68" r="38" fill="${accent}" opacity="0.28"/>
            <circle cx="76" cy="290" r="46" fill="${primary}" opacity="0.18"/>
            <rect x="78" y="96" width="204" height="132" rx="34" fill="#fffaf2" stroke="${primary}" stroke-width="10"/>
            <path d="M116 232h128c0 34-27 62-64 62s-64-28-64-62z" fill="${primary}"/>
            <path d="M126 126h108" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
            <path d="M130 160h98" stroke="${primary}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>
            <text x="180" y="206" text-anchor="middle" font-family="Arial, sans-serif" font-size="66" font-weight="900" fill="${primary}">${initials}</text>
            <text x="180" y="326" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="${accent}">${category}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function findImageByProductName(productName, restaurantImage) {
    const productSlug = slugify(productName);
    if (!productSlug) return "";

    const productTokens = productSlug.split("-").filter((token) => token.length > 1);
    const ranked = ASSET_IMAGE_PATHS
        .filter((image) => !isRestaurantImage(image) && imageKey(image) !== imageKey(restaurantImage))
        .map((image) => {
            const assetSlug = filenameSlug(image);
            const assetTokens = assetSlug.split("-").filter((token) => token.length > 1);
            const overlap = productTokens.filter((token) => assetTokens.includes(token)).length;
            const directMatch = assetSlug.includes(productSlug) || productSlug.includes(assetSlug);

            return {
                image,
                score: (directMatch ? 100 : 0) + overlap * 10 - Math.abs(assetTokens.length - productTokens.length),
            };
        })
        .filter((item) => item.score >= 18)
        .sort((a, b) => b.score - a.score);

    return ranked[0]?.image || "";
}

function getProductImageCandidates(product, categoryId, restaurant) {
    const currentImage = normalizeImagePath(product.image);
    const restaurantImage = normalizeImagePath(restaurant?.image || product.store?.image);
    const namedCandidates = getNamedImageCandidates(product.name);
    const matchedImage = findImageByProductName(product.name, restaurantImage);
    const seed = hashValue(`${categoryId}-${product.restaurantId || restaurant?.id || product.store?.id}-${product.name}`);

    return [
        currentImage && !isRestaurantImage(currentImage) && imageKey(currentImage) !== imageKey(restaurantImage) ? currentImage : "",
        ...namedCandidates,
        matchedImage,
        makeFoodPlaceholderImage(product.name, categoryId, seed),
    ].filter((image, index, images) => image && images.indexOf(image) === index);
}

function hashValue(value = "") {
    return String(value).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function prepLabel(minutes) {
    if (minutes <= 7) return "Món nhanh";
    if (minutes >= 18) return "Làm nóng/nướng mới";
    return "Bếp chuẩn";
}

function getPrepProfile(categoryId, productName, restaurantId) {
    const [min, max] = PREP_TIME_BY_CATEGORY[categoryId] || PREP_TIME_BY_CATEGORY.default;
    const span = Math.max(1, max - min);
    const seed = hashValue(`${categoryId}-${restaurantId}-${productName}`);
    const start = min + (seed % Math.max(2, Math.ceil(span / 2)));
    const end = Math.min(max + 3, start + 3 + (seed % 5));
    const minutes = Math.ceil((start + end) / 2);

    return {
        prepMinutes: minutes,
        prepTimeText: `${start}-${end} phút`,
        prepLabel: prepLabel(minutes),
    };
}

function getProductSignals(product, categoryId, restaurant) {
    const seed = hashValue(`${categoryId}-${restaurant?.id || product.store?.id || product.restaurantId}-${product.name}`);
    const soldCount = Number(product.purchaseCount || product.soldCount || (seed % 96));
    const rating = Number(product.rating || (4 + ((seed % 10) / 10)).toFixed(1));
    const isNew = seed % 7 === 0;

    return { soldCount, rating, isNew };
}

function withProductPrep(product, restaurant) {
    const categoryId = product.categoryId || restaurant?.categoryId || product.store?.categoryId;
    const profile = getPrepProfile(categoryId, product.name, product.restaurantId || restaurant?.id || product.store?.id);
    const imageCandidates = getProductImageCandidates(product, categoryId, restaurant);
    const signals = getProductSignals(product, categoryId, restaurant);

    return {
        ...product,
        ...profile,
        ...signals,
        categoryId,
        image: imageCandidates[0],
        imageCandidates,
        description: product.description || `Món đặc trưng tại ${restaurant?.name || product.store?.name || "quán"}, chuẩn bị theo từng đơn.`,
    };
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

        const product = {
            id: `p${pid++}`,
            restaurantId: restaurant.id,
            name,
            price: priceByCategory(restaurant.categoryId),
        };

        return withProductPrep(product, restaurant);
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
    try {
        const products = await apiGet(`/products/store/${encodeURIComponent(restaurantId)}`);
        if (Array.isArray(products)) {
            return products.map((product) => {
                const restaurant = product.store || RESTAURANTS.find((r) => String(r.id) === String(restaurantId) || String(r.id) === `r${restaurantId}`);
                return withProductPrep({
                    id: product.id,
                    restaurantId,
                    name: product.name,
                    price: Number(product.price || 0),
                    image: product.image,
                    description: product.description,
                    store: product.store,
                }, restaurant);
            });
        }
    } catch (error) {
        console.warn("Fallback to local food products", error);
    }

    await delay();

    const rid = String(restaurantId);

    return PRODUCTS.filter((p) => {
        const pid = String(p.restaurantId);
        // match cả "27" và "r27"
        return pid === rid || pid === `r${rid}` || `r${pid}` === rid;
    });
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
