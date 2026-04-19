import { renderProductCard } from "../../components/productCard.js";
import {
    getCategories,
    getRestaurantsByCategory,
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

export function setupFood({ user, onBackHome }) {
    const categoriesEl = document.getElementById("food-categories");
    const restaurantsEl = document.getElementById("food-restaurants");
    const productsEl = document.getElementById("food-products");
    const cartItemsEl = document.getElementById("cart-items");
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutMessage = document.getElementById("checkout-message");
    const backBtn = document.getElementById("back-home-btn");

    const state = {
        selectedCategoryId: null,
        selectedRestaurantId: null,
        restaurants: [],
        products: [],
        cart: createCartState(),
    };

    function drawCart() {
        renderCart(state.cart, { cartItemsEl, cartCountEl, cartTotalEl });
    }

    async function loadCategories() {
        const categories = await getCategories();
        if (!categories.length) return;

        categoriesEl.innerHTML = categories
            .map(
                (cat) =>
                    `<button class="chip-btn" data-category-id="${cat.id}">${cat.name}</button>`
            )
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

            await loadRestaurants(state.selectedCategoryId);
            productsEl.innerHTML = `<p class="empty-text">Hãy chọn nhà hàng để xem món.</p>`;
        });

        const first = categories[0];
        state.selectedCategoryId = first.id;
        categoriesEl.querySelector(`[data-category-id="${first.id}"]`)?.classList.add("is-active");
        await loadRestaurants(first.id);
    }

    async function loadRestaurants(categoryId) {
        state.restaurants = await getRestaurantsByCategory(categoryId);

        if (!state.restaurants.length) {
            restaurantsEl.innerHTML = `<p class="empty-text">Chưa có nhà hàng cho danh mục này.</p>`;
            productsEl.innerHTML = `<p class="empty-text">Chưa có món.</p>`;
            return;
        }

        restaurantsEl.innerHTML = state.restaurants
            .map((r) => {
                const rating = Number(r.rating || 0).toFixed(1);
                return `
                    <article class="restaurant-card" data-restaurant-id="${r.id}">
                        <div class="restaurant-main">
                            <div class="restaurant-logo">${r.logoText || "CG"}</div>
                            <div>
                                <p class="restaurant-name">${r.name}</p>
                                <p class="rating">⭐ ${rating}/5</p>
                            </div>
                        </div>
                        <button class="btn btn--secondary">Xem món</button>
                    </article>
                `;
            })
            .join("");

        restaurantsEl.addEventListener("click", async (event) => {
            const card = event.target.closest("[data-restaurant-id]");
            if (!card) return;
            checkoutMessage.textContent = "";
            state.selectedRestaurantId = card.dataset.restaurantId;

            restaurantsEl.querySelectorAll(".restaurant-card").forEach((el) => {
                el.classList.toggle("is-active", el.dataset.restaurantId === state.selectedRestaurantId);
            });

            await loadProducts(state.selectedRestaurantId);
        });

        const firstRestaurant = state.restaurants[0];
        state.selectedRestaurantId = firstRestaurant.id;
        restaurantsEl.querySelector(`[data-restaurant-id="${firstRestaurant.id}"]`)?.classList.add("is-active");
        await loadProducts(firstRestaurant.id);
    }

    async function loadProducts(restaurantId) {
        state.products = await getProductsByRestaurant(restaurantId);

        if (!state.products.length) {
            productsEl.innerHTML = `<p class="empty-text">Nhà hàng chưa có món.</p>`;
            return;
        }

        productsEl.innerHTML = state.products.map(renderProductCard).join("");

        productsEl.addEventListener("click", (event) => {
            const addBtn = event.target.closest(".js-add-to-cart");
            if (!addBtn) return;

            checkoutMessage.textContent = "";
            const productId = addBtn.dataset.productId;
            const product = state.products.find((p) => p.id === productId);
            if (!product) return;

            addToCart(state.cart, product);
            drawCart();
        });
    }

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
        await checkoutFood({
            user,
            cartState: state.cart,
            messageEl: checkoutMessage,
            onSuccess: drawCart,
        });
    });

    backBtn.addEventListener("click", () => {
        onBackHome?.();
    });

    drawCart();
    loadCategories();
}