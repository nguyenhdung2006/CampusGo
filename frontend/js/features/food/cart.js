import { renderCartItem } from "../../components/cartItem.js";

export function createCartState() {
    return {
        items: [],
    };
}

export function addToCart(cartState, product) {
    const existed = cartState.items.find((item) => item.id === product.id);
    if (existed) {
        existed.quantity += 1;
    } else {
        cartState.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
        });
    }
}

export function increaseItem(cartState, productId) {
    const item = cartState.items.find((x) => x.id === productId);
    if (item) item.quantity += 1;
}

export function decreaseItem(cartState, productId) {
    const item = cartState.items.find((x) => x.id === productId);
    if (!item) return;

    item.quantity -= 1;
    if (item.quantity <= 0) {
        cartState.items = cartState.items.filter((x) => x.id !== productId);
    }
}

export function getCartCount(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function renderCart(cartState, elements) {
    const { cartItemsEl, cartCountEl, cartTotalEl } = elements;
    const count = getCartCount(cartState);
    const total = getCartTotal(cartState);

    cartCountEl.textContent = `${count} món`;
    cartTotalEl.textContent = `${total.toLocaleString("vi-VN")}₫`;

    if (!cartState.items.length) {
        cartItemsEl.innerHTML = `<p class="empty-text">Chưa có món nào trong giỏ.</p>`;
        return;
    }

    cartItemsEl.innerHTML = cartState.items.map(renderCartItem).join("");
}