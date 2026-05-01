import { getAllItems, getMyItems } from "../../services/marketplaceService.js";
import { resetCreateItemForm, setupCreateItemForm } from "./createItem.js";
import { loadMarketplaceItemDetail } from "./itemDetail.js";

const state = {
    items: [],
    query: "",
    status: "ALL",
    mineOnly: false,
    currentUser: null,
    navigation: {},
};

function formatPrice(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString("vi-VN")}₫` : "Liên hệ";
}

function safeImage(src) {
    return src || "./assets/images/hqdefault.jpg";
}

function getSellerName(item) {
    return item.seller?.name || item.seller?.email || "CampusGo seller";
}

function isMyItem(item) {
    return state.currentUser && item.seller?.id && Number(state.currentUser.id) === Number(item.seller.id);
}

function renderItemCard(item) {
    return `
        <article class="marketplace-item-card" data-id="${item.id}">
            <img class="marketplace-item-card__image" src="${safeImage(item.imageUrl)}" alt="${item.title}">
            <div class="marketplace-item-card__body">
                <div class="marketplace-item-card__meta">
                    <span class="tag">${item.status === "AVAILABLE" ? "Còn bán" : "Đã bán"}</span>
                    ${isMyItem(item) ? `<span class="tag tag--soft">Của bạn</span>` : ""}
                </div>
                <h3>${item.title}</h3>
                <p class="marketplace-item-card__desc">${item.description || "Chưa có mô tả."}</p>
                <div class="marketplace-item-card__footer">
                    <strong>${formatPrice(item.price)}</strong>
                    <span>${getSellerName(item)}</span>
                </div>
                <button class="btn btn--secondary view-detail-btn" type="button" data-id="${item.id}">Xem chi tiết</button>
            </div>
        </article>
    `;
}

function getFilteredItems() {
    const query = state.query.trim().toLowerCase();

    return state.items.filter((item) => {
        const matchesStatus = state.status === "ALL" || item.status === state.status;
        const matchesQuery =
            !query ||
            [item.title, item.description, item.phone, getSellerName(item)]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));

        return matchesStatus && matchesQuery;
    });
}

function renderList() {
    const container = document.getElementById("marketplace-list");
    const count = document.getElementById("marketplace-count");
    const mineBtn = document.getElementById("marketplace-mine-btn");

    if (!container) return;

    const items = getFilteredItems();
    if (count) count.textContent = `${items.length} sản phẩm`;
    if (mineBtn) mineBtn.textContent = state.mineOnly ? "Xem tất cả" : "Bài của tôi";

    if (!items.length) {
        container.innerHTML = `
            <div class="mp-empty">
                <h3>Chưa có sản phẩm phù hợp</h3>
                <p>Hãy thử đổi bộ lọc hoặc đăng món đồ đầu tiên cho khu chợ sinh viên.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(renderItemCard).join("");
}

export async function loadMarketplaceList({ mineOnly = state.mineOnly } = {}) {
    const container = document.getElementById("marketplace-list");
    const count = document.getElementById("marketplace-count");

    state.mineOnly = mineOnly;
    if (container) container.innerHTML = `<p class="empty-text">Đang tải sản phẩm...</p>`;
    if (count) count.textContent = "Đang tải";

    try {
        const items = mineOnly ? await getMyItems(state.currentUser?.id) : await getAllItems();
        state.items = Array.isArray(items) ? items : [];
        renderList();
    } catch (error) {
        state.items = [];
        if (container) {
            container.innerHTML = `
                <div class="mp-empty">
                    <h3>Không tải được marketplace</h3>
                    <p>Kiểm tra backend hoặc phiên đăng nhập rồi thử lại.</p>
                </div>
            `;
        }
        if (count) count.textContent = "0 sản phẩm";
    }
}

export function loadMarketplaceDetail(id) {
    return loadMarketplaceItemDetail(id, {
        currentUser: state.currentUser,
        onDeleted: async () => {
            await loadMarketplaceList({ mineOnly: state.mineOnly });
            state.navigation.onOpenList?.();
        },
    });
}

export function setupMarketplace({ user, onBackHome, onOpenList, onOpenCreate, onOpenDetail } = {}) {
    state.currentUser = user;
    state.navigation = { onBackHome, onOpenList, onOpenCreate, onOpenDetail };

    const backHomeBtn = document.getElementById("back-to-home-btn");
    const openCreateBtn = document.getElementById("open-create-item-btn");
    const backDetailBtn = document.getElementById("back-to-marketplace-btn");
    const searchInput = document.getElementById("marketplace-search");
    const statusSelect = document.getElementById("marketplace-status-filter");
    const mineBtn = document.getElementById("marketplace-mine-btn");
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
            state.status = statusSelect.value;
            renderList();
        });
    }

    if (mineBtn && mineBtn.dataset.bound !== "true") {
        mineBtn.dataset.bound = "true";
        mineBtn.addEventListener("click", async () => {
            await loadMarketplaceList({ mineOnly: !state.mineOnly });
        });
    }

    if (list && list.dataset.bound !== "true") {
        list.dataset.bound = "true";
        list.addEventListener("click", (event) => {
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
