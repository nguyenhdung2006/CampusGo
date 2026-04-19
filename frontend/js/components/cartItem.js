export function renderCartItem(item) {
    const total = item.price * item.quantity;
    return `
        <article class="cart-item" data-cart-id="${item.id}">
            <div>
                <p class="cart-item__name">${item.name}</p>
                <p class="cart-item__meta">${item.price.toLocaleString("vi-VN")}₫ x ${item.quantity} = ${total.toLocaleString("vi-VN")}₫</p>
            </div>
            <div class="cart-item__actions">
                <button class="icon-btn js-minus" data-product-id="${item.id}">-</button>
                <span class="qty-pill">${item.quantity}</span>
                <button class="icon-btn js-plus" data-product-id="${item.id}">+</button>
            </div>
        </article>
    `;
}