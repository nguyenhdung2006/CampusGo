import { getAllItems, getMyItems, updateItem } from "../../services/marketplaceService.js";
import { resetCreateItemForm, setupCreateItemForm } from "./createItem.js";
import { loadMarketplaceItemDetail } from "./itemDetail.js";

const FAVORITES_KEY = "campusgo_marketplace_favorites";

const categoryLabels = {
    BOOKS: "Sách, giáo trình",
    TECH: "Đồ công nghệ",
    DORM: "Đồ phòng trọ",
    FASHION: "Quần áo",
    BIKE: "Xe đạp, xe máy",
    OTHER: "Khác",
};

const conditionLabels = {
    NEW: "Mới/như mới",
    GOOD: "Còn tốt",
    USED: "Đã dùng ổn",
    NEED_FIX: "Cần sửa nhẹ",
};

const state = {
    items: [],
    query: "",
    status: "AVAILABLE",
    category: "ALL",
    maxPrice: "ALL",
    sortBy: "NEWEST",
    mineOnly: false,
    favoritesOnly: false,
    favorites: new Set(),
    currentUser: null,
    navigation: {},
};

function readFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]").map(String));
    } catch {
        return new Set();
    }
}

function writeFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
}

function ensureToolbarEnhancements() {
    const toolbar = document.querySelector(".marketplace-toolbar");
    const mineBtn = document.getElementById("marketplace-mine-btn");
    if (!toolbar || toolbar.dataset.enhanced === "true") return;
    toolbar.dataset.enhanced = "true";

    mineBtn?.insertAdjacentHTML("beforebegin", `
        <select id="marketplace-category-filter" aria-label="Lọc nhóm đồ">
            <option value="ALL">Tất cả nhóm đồ</option>
            <option value="BOOKS">Sách, giáo trình</option>
            <option value="TECH">Đồ công nghệ</option>
            <option value="DORM">Đồ phòng trọ</option>
            <option value="FASHION">Quần áo</option>
            <option value="BIKE">Xe đạp, xe máy</option>
            <option value="OTHER">Khác</option>
        </select>
        <select id="marketplace-price-filter" aria-label="Lọc giá">
            <option value="ALL">Mọi mức giá</option>
            <option value="50000">Dưới 50k</option>
            <option value="100000">Dưới 100k</option>
            <option value="300000">Dưới 300k</option>
            <option value="500000">Dưới 500k</option>
        </select>
        <select id="marketplace-sort" aria-label="Sắp xếp">
            <option value="NEWEST">Mới đăng</option>
            <option value="PRICE_ASC">Giá thấp trước</option>
            <option value="PRICE_DESC">Giá cao trước</option>
            <option value="AVAILABLE">Ưu tiên còn bán</option>
        </select>
    `);

    mineBtn?.insertAdjacentHTML("afterend", `
        <button id="marketplace-favorites-btn" class="btn btn--secondary" type="button">Đã lưu (0)</button>
    `);
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
    return String(value).trim().toLowerCase();
}

function formatPrice(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString("vi-VN")}đ` : "Liên hệ";
}

function safeImage(src) {
    if (!src) return "./assets/images/hqdefault.jpg";
    if (src.startsWith("./") || src.startsWith("/") || src.startsWith("data:image/")) return src;
    if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(src)) return src;
    return "./assets/images/hqdefault.jpg";
}

function getSellerName(item) {
    return item.seller?.name || item.seller?.displayName || item.seller?.email || "Người bán CampusGo";
}

function isMyItem(item) {
    if (!state.currentUser || !item?.seller) return false;

    const sellerId = item.seller.id;
    const currentId = state.currentUser.id;
    if (sellerId && currentId && Number(sellerId) === Number(currentId)) return true;

    const sellerEmail = normalizeText(item.seller.email);
    const currentEmail = normalizeText(state.currentUser.email);
    if (sellerEmail && currentEmail && sellerEmail === currentEmail) return true;

    return false;
}

function getCategoryLabel(item) {
    return categoryLabels[item.category] || item.category || "Chưa phân loại";
}

function getConditionLabel(item) {
    return conditionLabels[item.conditionLabel] || item.conditionLabel || "Chưa rõ tình trạng";
}

function getPostedTime(item) {
    const raw = item.createdAt || item.updatedAt;
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function getStatusLabel(item) {
    return item.status === "SOLD" ? "Đã bán" : "Còn bán";
}

function renderItemCard(item) {
    const favorite = state.favorites.has(String(item.id));
    const pickup = item.pickupLocation || "Hẹn trong campus";
    const negotiable = item.negotiable ? `<span class="tag tag--soft">Có thương lượng</span>` : "";
    const postedTime = getPostedTime(item);
    const mine = isMyItem(item);

    return `
        <article class="marketplace-item-card ${item.status === "SOLD" ? "is-sold" : ""}" data-id="${escapeHtml(item.id)}">
            <button class="mp-favorite-btn ${favorite ? "is-active" : ""}" type="button" data-id="${escapeHtml(item.id)}" aria-label="Lưu tin yêu thích">
                ${favorite ? "Đã lưu" : "Lưu"}
            </button>
            <img class="marketplace-item-card__image" src="${escapeHtml(safeImage(item.imageUrl))}" alt="${escapeHtml(item.title)}">
            <div class="marketplace-item-card__body">
                <div class="marketplace-item-card__meta">
                    <span class="tag ${item.status === "SOLD" ? "tag--sold" : ""}">${getStatusLabel(item)}</span>
                    <span class="tag tag--soft">${escapeHtml(getCategoryLabel(item))}</span>
                    ${negotiable}
                    ${mine ? `<span class="tag tag--soft">Của bạn</span>` : ""}
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p class="marketplace-item-card__desc">${escapeHtml(item.description || "Người bán chưa thêm mô tả.")}</p>
                <div class="mp-card-facts">
                    <span>${escapeHtml(getConditionLabel(item))}</span>
                    <span>${escapeHtml(pickup)}</span>
                    ${postedTime ? `<span>Đăng ${escapeHtml(postedTime)}</span>` : ""}
                </div>
                <div class="marketplace-item-card__footer">
                    <strong>${formatPrice(item.price)}</strong>
                    <span>${escapeHtml(getSellerName(item))}</span>
                </div>
                <div class="mp-card-actions">
                    <button class="btn btn--secondary view-detail-btn" type="button" data-id="${escapeHtml(item.id)}">Xem chi tiết</button>
                    ${
                        mine
                            ? `<button class="btn btn--ghost toggle-status-btn" type="button" data-id="${escapeHtml(item.id)}" data-status="${item.status === "SOLD" ? "AVAILABLE" : "SOLD"}">${item.status === "SOLD" ? "Mở bán lại" : "Đã bán"}</button>`
                            : ""
                    }
                </div>
            </div>
        </article>
    `;
}

function matchesPrice(item) {
    if (state.maxPrice === "ALL") return true;
    const price = Number(item.price || 0);
    return price > 0 && price <= Number(state.maxPrice);
}

function getFilteredItems() {
    const query = normalizeText(state.query);

    const filtered = state.items.filter((item) => {
        const matchesStatus = state.status === "ALL" || item.status === state.status;
        const matchesCategory = state.category === "ALL" || item.category === state.category;
        const matchesFavorite = !state.favoritesOnly || state.favorites.has(String(item.id));
        const matchesQuery =
            !query ||
            [
                item.title,
                item.description,
                item.phone,
                item.pickupLocation,
                item.tradeMethod,
                getSellerName(item),
                getCategoryLabel(item),
                getConditionLabel(item),
            ]
                .filter(Boolean)
                .some((value) => normalizeText(value).includes(query));

        return matchesStatus && matchesCategory && matchesFavorite && matchesPrice(item) && matchesQuery;
    });

    return filtered.sort((a, b) => {
        if (state.sortBy === "PRICE_ASC") return Number(a.price || 0) - Number(b.price || 0);
        if (state.sortBy === "PRICE_DESC") return Number(b.price || 0) - Number(a.price || 0);
        if (state.sortBy === "AVAILABLE") return String(a.status).localeCompare(String(b.status));
        return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    });
}

function syncToolbarValues() {
    const statusSelect = document.getElementById("marketplace-status-filter");
    const categorySelect = document.getElementById("marketplace-category-filter");
    const priceSelect = document.getElementById("marketplace-price-filter");
    const sortSelect = document.getElementById("marketplace-sort");

    if (statusSelect) state.status = statusSelect.value = statusSelect.dataset.touched ? state.status : "AVAILABLE";
    if (categorySelect) categorySelect.value = state.category;
    if (priceSelect) priceSelect.value = state.maxPrice;
    if (sortSelect) sortSelect.value = state.sortBy;
}

function renderList() {
    const container = document.getElementById("marketplace-list");
    const count = document.getElementById("marketplace-count");
    const mineBtn = document.getElementById("marketplace-mine-btn");
    const favoriteBtn = document.getElementById("marketplace-favorites-btn");

    if (!container) return;

    const items = getFilteredItems();
    if (count) count.textContent = `${items.length} sản phẩm`;
    if (mineBtn) mineBtn.textContent = state.mineOnly ? "Xem tất cả" : "Bài của tôi";
    if (favoriteBtn) {
        favoriteBtn.textContent = state.favoritesOnly ? "Tất cả tin" : `Đã lưu (${state.favorites.size})`;
        favoriteBtn.classList.toggle("is-active", state.favoritesOnly);
    }

    if (!items.length) {
        container.innerHTML = `
            <div class="mp-empty">
                <h3>Chưa có sản phẩm phù hợp</h3>
                <p>Thử đổi bộ lọc, xem mục đã bán hoặc đăng món đồ đầu tiên cho khu chợ sinh viên.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(renderItemCard).join("");
}

async function updateItemStatus(id, status) {
    const item = state.items.find((entry) => String(entry.id) === String(id));
    if (!item) return;

    try {
        const updated = await updateItem(id, {
            ...item,
            status,
        });

        state.items = state.items.map((entry) => (String(entry.id) === String(id) ? updated : entry));
        renderList();
    } catch (error) {
        alert(error?.message || "Không cập nhật được trạng thái bài đăng.");
    }
}

export async function loadMarketplaceList({ mineOnly = state.mineOnly } = {}) {
    const container = document.getElementById("marketplace-list");
    const count = document.getElementById("marketplace-count");

    state.mineOnly = mineOnly;
    syncToolbarValues();
    if (container) container.innerHTML = `<p class="empty-text">Đang tải sản phẩm...</p>`;
    if (count) count.textContent = "Đang tải";

    try {
        const items = mineOnly ? await getMyItems(state.currentUser?.id) : await getAllItems();
        state.items = Array.isArray(items) ? items : [];
        renderList();
    } catch (error) {
        state.items = [];
        if (container) {
            const sessionExpired = error?.status === 401;
            container.innerHTML = `
                <div class="mp-empty">
                    <h3>${sessionExpired ? "Phiên đăng nhập đã hết hạn" : "Không tải được marketplace"}</h3>
                    <p>${escapeHtml(error?.message || "Kiểm tra backend hoặc phiên đăng nhập rồi thử lại.")}</p>
                </div>
            `;
        }
        if (count) count.textContent = "0 sản phẩm";
    }
}

export function loadMarketplaceDetail(id) {
    return loadMarketplaceItemDetail(id, {
        currentUser: state.currentUser,
        favorites: state.favorites,
        onFavoriteChanged: (itemId) => {
            const key = String(itemId);
            if (state.favorites.has(key)) state.favorites.delete(key);
            else state.favorites.add(key);
            writeFavorites();
        },
        onUpdated: async () => {
            await loadMarketplaceList({ mineOnly: state.mineOnly });
        },
        onDeleted: async () => {
            await loadMarketplaceList({ mineOnly: state.mineOnly });
            state.navigation.onOpenList?.();
        },
    });
}

export function setupMarketplace({ user, onBackHome, onOpenList, onOpenCreate, onOpenDetail } = {}) {
    state.currentUser = user;
    state.navigation = { onBackHome, onOpenList, onOpenCreate, onOpenDetail };
    state.favorites = readFavorites();
    ensureToolbarEnhancements();
    syncToolbarValues();

    const backHomeBtn = document.getElementById("back-to-home-btn");
    const openCreateBtn = document.getElementById("open-create-item-btn");
    const backDetailBtn = document.getElementById("back-to-marketplace-btn");
    const searchInput = document.getElementById("marketplace-search");
    const statusSelect = document.getElementById("marketplace-status-filter");
    const categorySelect = document.getElementById("marketplace-category-filter");
    const priceSelect = document.getElementById("marketplace-price-filter");
    const sortSelect = document.getElementById("marketplace-sort");
    const mineBtn = document.getElementById("marketplace-mine-btn");
    const favoriteBtn = document.getElementById("marketplace-favorites-btn");
    const list = document.getElementById("marketplace-list");

    if (backHomeBtn && backHomeBtn.dataset.bound !== "true") {
        backHomeBtn.dataset.bound = "true";
        backHomeBtn.addEventListener("click", () => state.navigation.onBackHome?.());
    }

    if (openCreateBtn && openCreateBtn.dataset.bound !== "true") {
        openCreateBtn.dataset.bound = "true";
        openCreateBtn.addEventListener("click", () => {
            resetCreateItemForm();
            state.navigation.onOpenCreate?.();
        });
    }

    if (backDetailBtn && backDetailBtn.dataset.bound !== "true") {
        backDetailBtn.dataset.bound = "true";
        backDetailBtn.addEventListener("click", () => state.navigation.onOpenList?.());
    }

    if (searchInput && searchInput.dataset.bound !== "true") {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener("input", () => {
            state.query = searchInput.value;
            renderList();
        });
    }

    if (statusSelect && statusSelect.dataset.bound !== "true") {
        statusSelect.dataset.bound = "true";
        statusSelect.addEventListener("change", () => {
            statusSelect.dataset.touched = "true";
            state.status = statusSelect.value;
            renderList();
        });
    }

    if (categorySelect && categorySelect.dataset.bound !== "true") {
        categorySelect.dataset.bound = "true";
        categorySelect.addEventListener("change", () => {
            state.category = categorySelect.value;
            renderList();
        });
    }

    if (priceSelect && priceSelect.dataset.bound !== "true") {
        priceSelect.dataset.bound = "true";
        priceSelect.addEventListener("change", () => {
            state.maxPrice = priceSelect.value;
            renderList();
        });
    }

    if (sortSelect && sortSelect.dataset.bound !== "true") {
        sortSelect.dataset.bound = "true";
        sortSelect.addEventListener("change", () => {
            state.sortBy = sortSelect.value;
            renderList();
        });
    }

    if (mineBtn && mineBtn.dataset.bound !== "true") {
        mineBtn.dataset.bound = "true";
        mineBtn.addEventListener("click", async () => {
            await loadMarketplaceList({ mineOnly: !state.mineOnly });
        });
    }

    if (favoriteBtn && favoriteBtn.dataset.bound !== "true") {
        favoriteBtn.dataset.bound = "true";
        favoriteBtn.addEventListener("click", () => {
            state.favoritesOnly = !state.favoritesOnly;
            renderList();
        });
    }

    if (list && list.dataset.bound !== "true") {
        list.dataset.bound = "true";
        list.addEventListener("click", async (event) => {
            const favorite = event.target.closest(".mp-favorite-btn");
            if (favorite) {
                const key = String(favorite.dataset.id);
                if (state.favorites.has(key)) state.favorites.delete(key);
                else state.favorites.add(key);
                writeFavorites();
                renderList();
                return;
            }

            const statusBtn = event.target.closest(".toggle-status-btn");
            if (statusBtn) {
                await updateItemStatus(statusBtn.dataset.id, statusBtn.dataset.status);
                return;
            }

            const btn = event.target.closest(".view-detail-btn");
            if (!btn) return;
            state.navigation.onOpenDetail?.(btn.dataset.id);
        });
    }

    setupCreateItemForm({
        user,
        onCreated: async (posted) => {
            await loadMarketplaceList({ mineOnly: false });
            state.navigation.onOpenDetail?.(posted?.id);
        },
        onCancel: () => state.navigation.onOpenList?.(),
    });
}
