function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function renderCartItem(item) {
    const total = item.price * item.quantity;
    const prepInfo = item.prepTimeText ? ` · chuẩn bị ${escapeHtml(item.prepTimeText)}` : "";

    return `
        <article class="cart-item" data-cart-id="${item.id}">
            <div>
                <p class="cart-item__name">${escapeHtml(item.name)}</p>
                <p class="cart-item__meta">${item.price.toLocaleString("vi-VN")}đ x ${item.quantity} = ${total.toLocaleString("vi-VN")}đ${prepInfo}</p>
            </div>
            <div class="cart-item__actions">
                <button class="icon-btn js-minus" data-product-id="${item.id}">-</button>
                <span class="qty-pill">${item.quantity}</span>
                <button class="icon-btn js-plus" data-product-id="${item.id}">+</button>
            </div>
        </article>
    `;
}
