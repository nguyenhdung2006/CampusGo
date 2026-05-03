import { renderCartItem } from "../../components/cartItem.js";

export const FREE_DELIVERY_THRESHOLD = 100000;
export const BASE_DELIVERY_FEE = 5000;

export function createCartState() {
    return {
        items: [],
        restaurantId: null,
        restaurantName: "",
        restaurantIsOpen: true,
        restaurantStatusText: "",
    };
}

function resetCartRestaurant(cartState) {
    cartState.restaurantId = null;
    cartState.restaurantName = "";
    cartState.restaurantIsOpen = true;
    cartState.restaurantStatusText = "";
}

export function addToCart(cartState, product, restaurant = {}) {
    const productRestaurantId = product.restaurantId || restaurant.id;

    if (
        cartState.items.length
        && cartState.restaurantId
        && productRestaurantId
        && String(cartState.restaurantId) !== String(productRestaurantId)
    ) {
        return {
            success: false,
            message: `Giỏ đang có món của ${cartState.restaurantName || "quán khác"}. Vui lòng thanh toán hoặc bỏ món cũ trước khi đổi quán.`,
        };
    }

    if (!cartState.items.length) {
        cartState.restaurantId = productRestaurantId || null;
        cartState.restaurantName = restaurant.name || product.store?.name || "";
        cartState.restaurantIsOpen = restaurant.isOpen !== false;
        cartState.restaurantStatusText = restaurant.statusText || "";
    }

    const existed = cartState.items.find((item) => String(item.id) === String(product.id));
    if (existed) {
        existed.quantity += 1;
    } else {
        cartState.items.push({
            id: product.id,
            restaurantId: productRestaurantId || null,
            name: product.name,
            price: product.price,
            prepMinutes: product.prepMinutes,
            prepTimeText: product.prepTimeText,
            quantity: 1,
        });
    }

    return { success: true };
}

export function increaseItem(cartState, productId) {
    const item = cartState.items.find((x) => String(x.id) === String(productId));
    if (item) item.quantity += 1;
}

export function decreaseItem(cartState, productId) {
    const item = cartState.items.find((x) => String(x.id) === String(productId));
    if (!item) return;

    item.quantity -= 1;
    if (item.quantity <= 0) {
        cartState.items = cartState.items.filter((x) => String(x.id) !== String(productId));
    }

    if (!cartState.items.length) {
        resetCartRestaurant(cartState);
    }
}

export function getCartCount(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getDeliveryFee(cartState) {
    const total = getCartTotal(cartState);
    if (!cartState.items.length || total >= FREE_DELIVERY_THRESHOLD) return 0;
    return BASE_DELIVERY_FEE;
}

export function getGrandTotal(cartState) {
    return getCartTotal(cartState) + getDeliveryFee(cartState);
}

function formatVnd(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function renderCart(cartState, elements) {
    const {
        cartItemsEl,
        cartCountEl,
        cartTotalEl,
        cartDeliveryFeeEl,
        cartGrandTotalEl,
        cartFreeShipHintEl,
    } = elements;
    const count = getCartCount(cartState);
    const total = getCartTotal(cartState);
    const deliveryFee = getDeliveryFee(cartState);
    const grandTotal = getGrandTotal(cartState);

    cartCountEl.textContent = `${count} món`;
    cartTotalEl.textContent = formatVnd(total);
    if (cartDeliveryFeeEl) cartDeliveryFeeEl.textContent = deliveryFee ? formatVnd(deliveryFee) : "Miễn phí";
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatVnd(grandTotal);
    if (cartFreeShipHintEl) {
        const remain = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
        cartFreeShipHintEl.textContent = remain && cartState.items.length
            ? `Thêm ${formatVnd(remain)} để được miễn phí giao trong campus.`
            : cartState.items.length
                ? "Đơn này được miễn phí giao trong campus."
                : "Miễn phí giao cho đơn từ 100.000đ.";
    }

    if (!cartState.items.length) {
        cartItemsEl.innerHTML = `<p class="empty-text">Chưa có món nào trong giỏ.</p>`;
        return;
    }

    cartItemsEl.innerHTML = cartState.items.map(renderCartItem).join("");
}
