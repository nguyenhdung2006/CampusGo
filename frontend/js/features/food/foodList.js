import { renderProductCard } from "../../components/productCard.js";
import { getProfileDisplayName } from "../../components/profilePopover.js";
import { getAddressBook } from "../../utils/addressStorage.js";
import { getStores } from "../../services/storeService.js";
import {
    getCategories,
    getProductsByRestaurant,
} from "../../services/productService.js";
import {
    createCartState,
    addToCart,
    increaseItem,
    decreaseItem,
    renderCart,
} from "./cart.js";
import { checkoutFood } from "./checkout.js";
import { getFeaturedReviews, openRatingModal } from "./rating.js";

const detailRestaurantImageEl = document.getElementById("detail-restaurant-image");
const detailRestaurantDescEl = document.getElementById("detail-restaurant-desc");
const detailRestaurantAddressEl = document.getElementById("detail-restaurant-address");

const addAddressBtn = document.getElementById("add-address-btn");
const extraAddressListEl = document.getElementById("extra-address-list");

const FALLBACK_IMG = "/frontend/assets/images/hqdefault.jpg";

function normalizeImagePath(path) {
    if (!path) return FALLBACK_IMG;
    if (path.startsWith("./assets/")) return `/frontend/${path.replace("./", "")}`;
    return path;
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
    return escapeHtml(value).replaceAll("\n", " ");
}

function formatVnd(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getDeliveryRange(restaurant) {
    const rating = Number(restaurant.rating || 0);
    const base = rating >= 4.4 ? 12 : rating >= 4 ? 16 : 20;
    return [base, base + 8];
}

function getRestaurantEta(restaurant) {
    const [start, end] = getDeliveryRange(restaurant);
    return `${start}-${end} phút`;
}

function getRestaurantHoursText(restaurant) {
    return restaurant.activeHoursText || restaurant.hoursText || (restaurant.openTime && restaurant.closeTime ? `${restaurant.openTime}-${restaurant.closeTime}` : "Giờ linh hoạt");
}

function getRestaurantScheduleText(restaurant) {
    return restaurant.hoursText || getRestaurantHoursText(restaurant);
}

function getRestaurantStatusText(restaurant) {
    if (restaurant.statusText) return restaurant.statusText;
    if (typeof restaurant.isOpen === "boolean") return restaurant.isOpen ? "Đang mở" : "Đang nghỉ";
    return "Đang mở";
}

function getRestaurantRatingLine(restaurant) {
    return `${Number(restaurant.rating || 0).toFixed(1)}/5 · ${getRestaurantEta(restaurant)} · ${getRestaurantFee(restaurant) ? formatVnd(getRestaurantFee(restaurant)) : "Free ship"} · ${getRestaurantStatusText(restaurant)}`;
}

function getCartPrepSummary(cartState) {
    const slowest = cartState.items.reduce((max, item) => {
        const current = Number(item.prepMinutes || 0);
        return current > Number(max.prepMinutes || 0) ? item : max;
    }, {});

    return slowest.prepTimeText ? `bếp ${slowest.prepTimeText}` : "bếp 8-12 phút";
}

function getRestaurantFee(restaurant) {
    const purchaseCount = Number(restaurant.purchaseCount || 0);
    return purchaseCount >= 20 ? 0 : 5000;
}

function getRestaurantBadge(restaurant) {
    const rating = Number(restaurant.rating || 0);
    const purchaseCount = Number(restaurant.purchaseCount || 0);
    if (restaurant.isOpen === false) return "Đang nghỉ";
    if (rating >= 4.5) return "Top rated";
    if (purchaseCount >= 20) return "Bán chạy";
    return "Đang mở";
}

function formatReviewDateTime(value) {
    if (!value) return "Chưa rõ thời gian";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa rõ thời gian";
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function getReviewItemText(review) {
    const items = Array.isArray(review.items) ? review.items : [];
    if (!items.length) return "Món đã đặt";
    return items
        .map((item) => `${item.name || "Món đã đặt"}${Number(item.quantity || 1) > 1 ? ` x${Number(item.quantity || 1)}` : ""}`)
        .join(", ");
}

function getReviewComment(review) {
    return review.comment || `Đã chấm ${Number(review.stars || 0).toFixed(0)} sao cho đơn này.`;
}

export function setupFood({ user, onBackHome }) {
    const categoriesEl = document.getElementById("food-categories");
    const restaurantsEl = document.getElementById("food-restaurants");
    const productsEl = document.getElementById("food-products");

    const restaurantCountEl = document.getElementById("restaurant-count");
    const listViewEl = document.getElementById("restaurant-list-view");
    const detailViewEl = document.getElementById("restaurant-detail-view");
    const detailRestaurantNameEl = document.getElementById("detail-restaurant-name");
    const detailRestaurantRatingEl = document.getElementById("detail-restaurant-rating");

    const cartItemsEl = document.getElementById("cart-items");
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutMessage = document.getElementById("checkout-message");

    const backHomeBtn = document.getElementById("back-home-btn");
    const backToRestaurantsBtn = document.getElementById("back-to-restaurants-btn");

    const state = {
        selectedCategoryId: null,
        selectedRestaurantId: null,
        restaurants: [],
        products: [],
        cart: createCartState(),
        viewMode: "list",
        restaurantQuery: "",
        sortBy: "POPULAR",
        selectedRestaurant: null,
        paymentMethod: "CASH",
        orderNote: "",
        reviewPage: 1,
    };

    function renderCartFeaturedReview() {
        const reviewBox = document.getElementById("cart-featured-review");
        if (!reviewBox) return;

        const restaurantId = state.viewMode === "detail" ? state.selectedRestaurantId : null;
        const reviews = restaurantId ? getFeaturedReviews(restaurantId) : [];
        const restaurant = state.restaurants.find((r) => String(r.id) === String(restaurantId)) || state.selectedRestaurant;
        const pageSize = 5;
        const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
        state.reviewPage = Math.min(Math.max(1, state.reviewPage), totalPages);
        const pageReviews = reviews.slice((state.reviewPage - 1) * pageSize, state.reviewPage * pageSize);

        if (!reviews.length) {
            reviewBox.hidden = true;
            reviewBox.innerHTML = "";
            return;
        }

        reviewBox.hidden = false;
        reviewBox.innerHTML = `
            <div class="cart-review-head">
                <div>
                    <p class="cart-review-title">Đánh giá theo từng đơn</p>
                    <p class="cart-review-store">${escapeHtml(restaurant?.name || "Quán đã đặt")}</p>
                </div>
                <span>${reviews.length} review</span>
            </div>
            <div class="cart-review-list">
                ${pageReviews.map((review) => `
                    <article class="cart-review-item">
                        <p class="cart-review-meta">${escapeHtml(formatReviewDateTime(review.createdAt))} · ${escapeHtml(review.reviewerName || "Khách CampusGo")}</p>
                        <p class="cart-review-dish">${escapeHtml(getReviewItemText(review))}</p>
                        <p class="cart-review-text"><span>${Number(review.stars || 0).toFixed(0)}★</span> ${escapeHtml(getReviewComment(review))}</p>
                    </article>
                `).join("")}
            </div>
            ${totalPages > 1 ? `
                <div class="cart-review-pager">
                    <button type="button" class="js-review-page" data-review-page="${state.reviewPage - 1}" ${state.reviewPage <= 1 ? "disabled" : ""}>‹</button>
                    <span>${state.reviewPage}/${totalPages}</span>
                    <button type="button" class="js-review-page" data-review-page="${state.reviewPage + 1}" ${state.reviewPage >= totalPages ? "disabled" : ""}>›</button>
                </div>
            ` : ""}
        `;
    }

    function drawCart() {
        renderCart(state.cart, {
            cartItemsEl,
            cartCountEl,
            cartTotalEl,
            cartDeliveryFeeEl: document.getElementById("cart-delivery-fee"),
            cartGrandTotalEl: document.getElementById("cart-grand-total"),
            cartFreeShipHintEl: document.getElementById("cart-free-ship-hint"),
        });

        const checkoutMetaEl = document.getElementById("checkout-meta");
        if (checkoutMetaEl) {
            const cartRestaurant = state.restaurants.find((r) => String(r.id) === String(state.cart.restaurantId));
            const etaRestaurant = cartRestaurant || state.selectedRestaurant;
            checkoutMetaEl.textContent = state.cart.items.length
                ? `${state.cart.items.length} loại món · ${getCartPrepSummary(state.cart)} · giao ${etaRestaurant ? getRestaurantEta(etaRestaurant) : "15-25 phút"}`
                : "Chọn món để xem thời gian giao dự kiến.";
        }

        renderCartFeaturedReview();
    }

    function ensureVipControls() {
        const categoryPanel = categoriesEl?.closest(".food-panel");
        if (categoryPanel && categoryPanel.dataset.vipReady !== "true") {
            categoryPanel.dataset.vipReady = "true";
            categoryPanel.insertAdjacentHTML("beforeend", `
                <div class="food-tools">
                    <label class="food-search">
                        <span>Tìm nhanh</span>
                        <input id="food-search-input" type="search" placeholder="Tên quán, địa điểm, món đang thèm...">
                    </label>
                    <label class="food-sort">
                        <span>Sắp xếp</span>
                        <select id="food-sort-select">
                            <option value="POPULAR">Phổ biến</option>
                            <option value="OPEN">Đang mở trước</option>
                            <option value="RATING">Điểm cao</option>
                            <option value="FAST">Giao nhanh</option>
                            <option value="FEE">Phí thấp</option>
                        </select>
                    </label>
                </div>
                <div class="food-quick-stats">
                    <span>Nhiều ca sáng/trưa/tối</span>
                    <span>Bếp từng món riêng</span>
                    <span>Chặn đặt khi quán nghỉ</span>
                    <span>Miễn phí từ 100k</span>
                </div>
            `);
        }

        const summaryEl = document.querySelector(".cart-summary");
        if (summaryEl && summaryEl.dataset.vipReady !== "true") {
            summaryEl.dataset.vipReady = "true";
            const totalRow = cartTotalEl?.closest(".cart-row");
            totalRow?.insertAdjacentHTML("afterend", `
                <div class="cart-row cart-row--muted">
                    <span>Phí giao campus</span>
                    <strong id="cart-delivery-fee">0đ</strong>
                </div>
                <div class="cart-row cart-row--grand">
                    <span>Thanh toán</span>
                    <strong id="cart-grand-total">0đ</strong>
                </div>
                <p id="cart-free-ship-hint" class="cart-hint">Miễn phí giao cho đơn từ 100.000đ.</p>
            `);

            checkoutBtn?.insertAdjacentHTML("beforebegin", `
                <div class="checkout-options">
                    <label>
                        Thanh toán
                        <select id="food-payment-method">
                            <option value="CASH">Tiền mặt khi nhận</option>
                            <option value="BANKING">Chuyển khoản</option>
                            <option value="STUDENT_WALLET">Ví sinh viên</option>
                        </select>
                    </label>
                    <label>
                        Ghi chú
                        <textarea id="food-order-note" rows="3" maxlength="180" placeholder="Ít cay, thêm muỗng, gọi khi tới cổng..."></textarea>
                    </label>
                </div>
                <div class="checkout-progress">
                    <span class="is-done">Chọn món</span>
                    <span>Quán xác nhận</span>
                    <span>Shipper nhận</span>
                    <span>Giao tới bạn</span>
                </div>
                <p id="checkout-meta" class="cart-hint">Chọn món để xem thời gian giao dự kiến.</p>
            `);

            checkoutMessage?.insertAdjacentHTML("afterend", `<div id="cart-featured-review" class="cart-featured-review" hidden></div>`);
        }

        document.getElementById("cart-featured-review")?.addEventListener("click", (event) => {
            const btn = event.target.closest(".js-review-page");
            if (!btn || btn.disabled) return;
            state.reviewPage = Number(btn.dataset.reviewPage || 1);
            renderCartFeaturedReview();
        });

        const searchInput = document.getElementById("food-search-input");
        const sortSelect = document.getElementById("food-sort-select");
        const paymentSelect = document.getElementById("food-payment-method");
        const noteInput = document.getElementById("food-order-note");

        if (searchInput && searchInput.dataset.bound !== "true") {
            searchInput.dataset.bound = "true";
            searchInput.addEventListener("input", () => {
                state.restaurantQuery = searchInput.value;
                renderRestaurants();
            });
        }

        if (sortSelect && sortSelect.dataset.bound !== "true") {
            sortSelect.dataset.bound = "true";
            sortSelect.addEventListener("change", () => {
                state.sortBy = sortSelect.value;
                renderRestaurants();
            });
        }

        if (paymentSelect && paymentSelect.dataset.bound !== "true") {
            paymentSelect.dataset.bound = "true";
            paymentSelect.addEventListener("change", () => {
                state.paymentMethod = paymentSelect.value;
            });
        }

        if (noteInput && noteInput.dataset.bound !== "true") {
            noteInput.dataset.bound = "true";
            noteInput.addEventListener("input", () => {
                state.orderNote = noteInput.value;
            });
        }
    }

    function getVisibleRestaurants() {
        const query = state.restaurantQuery.trim().toLowerCase();
        const visible = state.restaurants.filter((restaurant) => {
            if (!query) return true;
            return [
                restaurant.name,
                restaurant.address,
                restaurant.description,
                restaurant.hoursText,
                restaurant.activeHoursText,
                restaurant.statusText,
                getRestaurantBadge(restaurant),
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });

        return visible.sort((a, b) => {
            if (state.sortBy === "OPEN") return Number(b.isOpen === true) - Number(a.isOpen === true) || Number(getRestaurantEta(a).split("-")[0]) - Number(getRestaurantEta(b).split("-")[0]);
            if (state.sortBy === "RATING") return Number(b.rating || 0) - Number(a.rating || 0);
            if (state.sortBy === "FAST") return Number(getRestaurantEta(a).split("-")[0]) - Number(getRestaurantEta(b).split("-")[0]);
            if (state.sortBy === "FEE") return getRestaurantFee(a) - getRestaurantFee(b);
            return Number(b.purchaseCount || 0) - Number(a.purchaseCount || 0) || Number(b.rating || 0) - Number(a.rating || 0);
        });
    }

    function renderRestaurants() {
        const visibleRestaurants = getVisibleRestaurants();
        restaurantCountEl.textContent = `${visibleRestaurants.length}/${state.restaurants.length} quán`;

        if (!visibleRestaurants.length) {
            restaurantsEl.innerHTML = `<p class="empty-text">Chưa có quán phù hợp. Thử đổi từ khóa hoặc danh mục món.</p>`;
            return;
        }

        restaurantsEl.innerHTML = visibleRestaurants
            .map((r) => `
            <article class="restaurant-card" data-restaurant-id="${r.id}">
            <div class="restaurant-main">
                <img class="restaurant-thumb" src="${escapeHtml(normalizeImagePath(r.image))}" alt="${escapeHtml(r.name)}">
                <div class="restaurant-info">
                <div class="restaurant-title-row">
                    <p class="restaurant-name">${escapeHtml(r.name)}</p>
                    <span class="food-mini-badge ${r.isOpen === false ? "is-closed" : ""}">${getRestaurantBadge(r)}</span>
                </div>
                <p class="restaurant-address">${escapeHtml(r.address || "Trong campus")}</p>
                <div class="restaurant-metrics">
                    <span>${Number(r.rating || 0).toFixed(1)}/5</span>
                    <span>${r.purchaseCount || 0} lượt mua</span>
                    <span>${getRestaurantEta(r)}</span>
                    <span>${escapeHtml(getRestaurantHoursText(r))}</span>
                    <span>${getRestaurantFee(r) ? formatVnd(getRestaurantFee(r)) : "Free ship"}</span>
                </div>
                </div>
            </div>
            <button class="btn btn--secondary">Xem món</button>
            </article>
        `)
            .join("");
    }

    function switchToListView() {
        state.viewMode = "list";
        listViewEl.style.display = "grid";
        detailViewEl.style.display = "none";
        renderCartFeaturedReview();
    }

    function switchToDetailView() {
        state.viewMode = "detail";
        listViewEl.style.display = "none";
        detailViewEl.style.display = "grid";
        renderCartFeaturedReview();
    }

    function setupAddressSection() {
        addAddressBtn?.addEventListener("click", () => {
            const id = `extra-address-${Date.now()}`;
            const row = document.createElement("div");
            const addressBook = getAddressBook();
            const defaultAddress = addressBook.defaultAddress?.trim();

            if (!defaultAddress) {
                checkoutMessage.textContent = "Vui lòng nhập địa chỉ mặc định (bấm 📍 trên thanh trên cùng).";
                return;
            }

            row.className = "extra-address-item";
            row.innerHTML = `
            <input id="${id}" type="text" placeholder="Nhập địa chỉ phụ..." />
            <button class="icon-btn js-remove-address" type="button">✕</button>
        `;
            extraAddressListEl.appendChild(row);
        });

        extraAddressListEl?.addEventListener("click", (event) => {
            const btn = event.target.closest(".js-remove-address");
            if (!btn) return;
            btn.closest(".extra-address-item")?.remove();
        });
    }

    async function loadCategories() {
        const categories = await getCategories();
        if (!categories.length) return;

        categoriesEl.innerHTML = categories
            .map((cat) => `<button class="chip-btn" data-category-id="${cat.id}">${cat.name}</button>`)
            .join("");

        categoriesEl.addEventListener("click", async (event) => {
            const btn = event.target.closest("[data-category-id]");
            if (!btn) return;

            checkoutMessage.textContent = "";
            state.selectedCategoryId = btn.dataset.categoryId;
            state.selectedRestaurantId = null;
            state.selectedRestaurant = null;
            state.reviewPage = 1;

            categoriesEl.querySelectorAll(".chip-btn").forEach((b) => {
                b.classList.toggle("is-active", b.dataset.categoryId === state.selectedCategoryId);
            });

            state.restaurants = await getStores(state.selectedCategoryId);
            renderRestaurants();
            switchToListView();
        });

        const firstCategory = categories[0];
        state.selectedCategoryId = firstCategory.id;
        categoriesEl.querySelector(`[data-category-id="${firstCategory.id}"]`)?.classList.add("is-active");
        state.restaurants = await getStores(firstCategory.id);
        renderRestaurants();
        switchToListView();
    }

    function renderRestaurantHoursStrip(restaurant) {
        let strip = document.getElementById("detail-restaurant-hours");
        if (!strip) {
            strip = document.createElement("div");
            strip.id = "detail-restaurant-hours";
            strip.className = "restaurant-hours-strip";
            detailRestaurantAddressEl.insertAdjacentElement("afterend", strip);
        }

        strip.classList.toggle("is-closed", restaurant.isOpen === false);
        const shifts = Array.isArray(restaurant.todayShifts) && restaurant.todayShifts.length
            ? restaurant.todayShifts
            : [{ label: "Hôm nay", open: restaurant.openTime || "--:--", close: restaurant.closeTime || "--:--" }];

        strip.innerHTML = `
            <span>${escapeHtml(getRestaurantStatusText(restaurant))}</span>
            ${shifts.map((shift) => `<span>${escapeHtml(shift.label)} ${escapeHtml(shift.open)}-${escapeHtml(shift.close)}</span>`).join("")}
            <span>${escapeHtml(restaurant.nextOpenText || getRestaurantHoursText(restaurant))}</span>
            <span>Giao ${escapeHtml(getRestaurantEta(restaurant))}</span>
        `;
    }

    function ensureProductPreviewModal() {
        let overlay = document.getElementById("product-preview-root");
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = "product-preview-root";
        overlay.className = "product-preview-overlay";
        overlay.style.display = "none";
        document.body.appendChild(overlay);
        return overlay;
    }

    function addProductFromPreview(product) {
        if (state.selectedRestaurant?.isOpen === false) {
            checkoutMessage.textContent = `${state.selectedRestaurant?.name || "Quán này"} đang ngoài ca bán. ${state.selectedRestaurant?.nextOpenText || "Vui lòng quay lại ca tiếp theo."}`;
            return;
        }

        const result = addToCart(state.cart, product, state.selectedRestaurant);
        if (result?.success === false) {
            checkoutMessage.textContent = result.message;
            return;
        }

        checkoutMessage.textContent = `Đã thêm ${product.name} vào giỏ.`;
        drawCart();
    }

    function openProductPreview(product) {
        const overlay = ensureProductPreviewModal();
        const imageCandidates = (product.imageCandidates?.length ? product.imageCandidates : [product.image, "/frontend/assets/images/icon.jpg"])
            .map(normalizeImagePath)
            .filter((src, index, list) => src && list.indexOf(src) === index);
        const imageSrc = imageCandidates[0] || "/frontend/assets/images/icon.jpg";
        const fallbackImages = imageCandidates.slice(1).join("|");
        const isRestaurantOpen = product.restaurantIsOpen !== false && state.selectedRestaurant?.isOpen !== false;

        overlay.innerHTML = `
            <div class="product-preview-modal">
                <button class="rating-close-btn js-product-preview-close" type="button" aria-label="Đóng">×</button>
                <div class="product-preview-media">
                    <img src="${escapeAttr(imageSrc)}" alt="${escapeAttr(product.name)}" data-fallbacks="${escapeAttr(fallbackImages)}" data-fallback-index="0" onerror="const list=this.dataset.fallbacks?this.dataset.fallbacks.split('|'):[];const index=Number(this.dataset.fallbackIndex||0);if(index<list.length){this.dataset.fallbackIndex=String(index+1);this.src=list[index];}else{this.onerror=null;this.src='/frontend/assets/images/icon.jpg';}">
                </div>
                <div class="product-preview-body">
                    <p class="eyebrow">${escapeHtml(state.selectedRestaurant?.name || "Món trong campus")}</p>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="price">${Number(product.price || 0).toLocaleString("vi-VN")}đ</p>
                    <p class="product-preview-desc">${escapeHtml(product.description || "Món được chuẩn bị theo từng đơn, giao nhanh trong campus.")}</p>
                    <div class="product-preview-meta">
                        <span>${escapeHtml(product.prepTimeText || "8-12 phút")}</span>
                        <span>${escapeHtml(product.prepLabel || "Bếp chuẩn")}</span>
                        <span>${Number(product.soldCount || 0)} lượt gọi</span>
                        <span>${Number(product.rating || 0).toFixed(1)}/5</span>
                    </div>
                    <button class="btn btn--primary btn--full js-product-preview-add" type="button" data-product-id="${escapeAttr(product.id)}" ${isRestaurantOpen ? "" : "disabled"}>
                        ${isRestaurantOpen ? "Thêm vào giỏ" : "Quán đang nghỉ"}
                    </button>
                </div>
            </div>
        `;

        overlay.style.display = "grid";
        overlay.querySelector(".js-product-preview-close")?.addEventListener("click", () => {
            overlay.style.display = "none";
        });
        overlay.querySelector(".js-product-preview-add")?.addEventListener("click", () => {
            addProductFromPreview(product);
            overlay.style.display = "none";
        });
        overlay.onclick = (event) => {
            if (event.target === overlay) overlay.style.display = "none";
        };
    }

    async function openRestaurantDetail(restaurantId) {
        state.selectedRestaurantId = restaurantId;
        state.reviewPage = 1;
        const selectedRestaurant = state.restaurants.find((r) => String(r.id) === String(restaurantId));
        if (!selectedRestaurant) return;
        state.selectedRestaurant = selectedRestaurant;

        detailRestaurantNameEl.textContent = selectedRestaurant.name;
        detailRestaurantRatingEl.textContent = getRestaurantRatingLine(selectedRestaurant);
        detailRestaurantDescEl.textContent =
            selectedRestaurant.description || "Quán ăn nội bộ với thực đơn đa dạng, phục vụ nhanh trong khuôn viên campus.";
        detailRestaurantImageEl.src = normalizeImagePath(selectedRestaurant.image);
        detailRestaurantImageEl.alt = `Ảnh quán ${selectedRestaurant.name}`;
        detailRestaurantAddressEl.textContent = selectedRestaurant.address || "Đang cập nhật địa chỉ quán";
        renderRestaurantHoursStrip(selectedRestaurant);

        const products = await getProductsByRestaurant(restaurantId);
        state.products = products.map((product) => ({
            ...product,
            restaurantId,
            restaurantIsOpen: selectedRestaurant.isOpen !== false,
            restaurantStatusText: getRestaurantStatusText(selectedRestaurant),
        }));

        if (!state.products.length) {
            productsEl.innerHTML = `<p class="empty-text">Nhà hàng chưa có món.</p>`;
        } else {
            productsEl.innerHTML = state.products.map(renderProductCard).join("");
        }

        drawCart();
        switchToDetailView();
    }

    restaurantsEl.addEventListener("click", async (event) => {
        const card = event.target.closest("[data-restaurant-id]");
        if (!card) return;
        checkoutMessage.textContent = "";
        await openRestaurantDetail(card.dataset.restaurantId);
    });

    productsEl.addEventListener("click", (event) => {
        const previewBtn = event.target.closest(".js-preview-product");
        if (previewBtn) {
            const product = state.products.find((p) => String(p.id) === String(previewBtn.dataset.productId));
            if (product) openProductPreview(product);
            return;
        }

        const addBtn = event.target.closest(".js-add-to-cart");
        if (!addBtn) return;

        checkoutMessage.textContent = "";
        if (addBtn.disabled || state.selectedRestaurant?.isOpen === false) {
            checkoutMessage.textContent = `${state.selectedRestaurant?.name || "Quán này"} đang ngoài ca bán. ${state.selectedRestaurant?.nextOpenText || "Vui lòng quay lại ca tiếp theo."}`;
            return;
        }

        const productId = addBtn.dataset.productId;
        const product = state.products.find((p) => String(p.id) === String(productId));
        if (!product) return;

        const result = addToCart(state.cart, product, state.selectedRestaurant);
        if (result?.success === false) {
            checkoutMessage.textContent = result.message;
            return;
        }

        drawCart();
    });

    cartItemsEl.addEventListener("click", (event) => {
        const plusBtn = event.target.closest(".js-plus");
        const minusBtn = event.target.closest(".js-minus");

        if (plusBtn) {
            increaseItem(state.cart, plusBtn.dataset.productId);
            drawCart();
            return;
        }

        if (minusBtn) {
            decreaseItem(state.cart, minusBtn.dataset.productId);
            drawCart();
        }
    });

    checkoutBtn.addEventListener("click", async () => {
        const addressBook = getAddressBook();
        const orderedRestaurantId = state.cart.restaurantId || state.selectedRestaurantId;
        const orderedRestaurant = state.restaurants.find((r) => String(r.id) === String(orderedRestaurantId)) || state.selectedRestaurant;

        if (orderedRestaurant?.isOpen === false || state.cart.restaurantIsOpen === false) {
            checkoutMessage.textContent = `${orderedRestaurant?.name || state.cart.restaurantName || "Quán"} đang ngoài ca bán. ${orderedRestaurant?.nextOpenText || "Vui lòng chọn quán đang mở."}`;
            return;
        }

        const defaultAddress = (addressBook?.defaultAddress || "").trim();
        if (!defaultAddress) {
            checkoutMessage.textContent = "Vui lòng nhập địa chỉ giao hàng mặc định (bấm 📍 Địa chỉ trên thanh trên cùng).";
            return;
        }

        await checkoutFood({
            user,
            cartState: state.cart,
            messageEl: checkoutMessage,
            paymentMethod: state.paymentMethod,
            note: state.orderNote,
            restaurant: orderedRestaurant,
            onSuccess: (orderContext) => {
                drawCart();
                const noteInput = document.getElementById("food-order-note");
                if (noteInput) noteInput.value = "";
                state.orderNote = "";

                if (orderedRestaurantId) {
                    openRatingModal({
                        restaurantId: orderedRestaurantId,
                        orderId: orderContext?.orderId,
                        orderedItems: orderContext?.orderedItems || [],
                        reviewerName: getProfileDisplayName(user),
                        reviewerKey: user?.email || String(user?.id || ""),
                        restaurantName: orderedRestaurant?.name || orderContext?.restaurantName || "",
                        onRated: async () => {
                            state.restaurants = await getStores(state.selectedCategoryId);
                            renderRestaurants();

                            const updated = state.restaurants.find((r) => String(r.id) === String(state.selectedRestaurantId));
                            if (updated) {
                                detailRestaurantRatingEl.textContent = getRestaurantRatingLine(updated);
                                renderCartFeaturedReview();
                                renderRestaurantHoursStrip(updated);
                            }
                        },
                    });
                }
            },
        });
    });

    backToRestaurantsBtn?.addEventListener("click", () => {
        switchToListView();
    });

    backHomeBtn?.addEventListener("click", () => {
        onBackHome?.();
    });

    ensureVipControls();
    drawCart();
    loadCategories();
    setupAddressSection();
}
