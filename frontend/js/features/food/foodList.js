import { renderProductCard } from "../../components/productCard.js";
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
import { openRatingModal } from "./rating.js";

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
    };

    function drawCart() {
        renderCart(state.cart, { cartItemsEl, cartCountEl, cartTotalEl });
    }

    function renderRestaurants() {
        restaurantCountEl.textContent = `${state.restaurants.length} quán`;

        if (!state.restaurants.length) {
            restaurantsEl.innerHTML = `<p class="empty-text">Chưa có nhà hàng cho danh mục này.</p>`;
            return;
        }

        restaurantsEl.innerHTML = state.restaurants
            .map((r) => `
            <article class="restaurant-card" data-restaurant-id="${r.id}">
            <div class="restaurant-main">
                <img class="restaurant-thumb" src="${normalizeImagePath(r.image)}" alt="${r.name}">
                <div class="restaurant-info">
                <p class="restaurant-name">${r.name}</p>
                <p class="rating">⭐ ${Number(r.rating || 0).toFixed(1)}/5</p>
                <p class="purchase-count">🛒 ${r.purchaseCount || 0} lượt mua</p>
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
    }

    function switchToDetailView() {
        state.viewMode = "detail";
        listViewEl.style.display = "none";
        detailViewEl.style.display = "grid";
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

    async function openRestaurantDetail(restaurantId) {
        state.selectedRestaurantId = restaurantId;
        const selectedRestaurant = state.restaurants.find((r) => String(r.id) === String(restaurantId));
        if (!selectedRestaurant) return;

        detailRestaurantNameEl.textContent = selectedRestaurant.name;
        detailRestaurantRatingEl.textContent = `⭐ ${Number(selectedRestaurant.rating || 0).toFixed(1)}/5`;
        detailRestaurantDescEl.textContent =
            selectedRestaurant.description || "Quán ăn nội bộ với thực đơn đa dạng, phục vụ nhanh trong khuôn viên campus.";
        detailRestaurantImageEl.src = normalizeImagePath(selectedRestaurant.image);
        detailRestaurantImageEl.alt = `Ảnh quán ${selectedRestaurant.name}`;
        detailRestaurantAddressEl.textContent = `📍 ${selectedRestaurant.address || "Đang cập nhật địa chỉ quán"}`;

        state.products = await getProductsByRestaurant(restaurantId);

        if (!state.products.length) {
            productsEl.innerHTML = `<p class="empty-text">Nhà hàng chưa có món.</p>`;
        } else {
            productsEl.innerHTML = state.products.map(renderProductCard).join("");
        }

        switchToDetailView();
    }

    restaurantsEl.addEventListener("click", async (event) => {
        const card = event.target.closest("[data-restaurant-id]");
        if (!card) return;
        checkoutMessage.textContent = "";
        await openRestaurantDetail(card.dataset.restaurantId);
    });

    productsEl.addEventListener("click", (event) => {
        const addBtn = event.target.closest(".js-add-to-cart");
        if (!addBtn) return;

        checkoutMessage.textContent = "";
        const productId = addBtn.dataset.productId;
        const product = state.products.find((p) => String(p.id) === String(productId));
        if (!product) return;

        addToCart(state.cart, product);
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
        const orderedRestaurantId = state.selectedRestaurantId;

        const defaultAddress = (addressBook?.defaultAddress || "").trim();
        if (!defaultAddress) {
            checkoutMessage.textContent = "Vui lòng nhập địa chỉ giao hàng mặc định (bấm 📍 Địa chỉ trên thanh trên cùng).";
            return;
        }

        await checkoutFood({
            user,
            cartState: state.cart,
            messageEl: checkoutMessage,
            onSuccess: () => {
                drawCart();

                if (orderedRestaurantId) {
                    openRatingModal({
                        restaurantId: orderedRestaurantId,
                        onRated: async () => {
                            state.restaurants = await getStores(state.selectedCategoryId);
                            renderRestaurants();

                            const updated = state.restaurants.find((r) => String(r.id) === String(state.selectedRestaurantId));
                            if (updated) {
                                detailRestaurantRatingEl.textContent = `⭐ ${Number(updated.rating || 0).toFixed(1)}/5`;
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

    drawCart();
    loadCategories();
    setupAddressSection();
}