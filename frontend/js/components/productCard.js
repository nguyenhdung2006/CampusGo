export function renderProductCard(product) {
    return `
        <article class="product-card" data-product-id="${product.id}">
            <div>
                <h4>${product.name}</h4>
                <p class="price">${product.price.toLocaleString("vi-VN")}₫</p>
            </div>
            <button class="btn btn--secondary js-add-to-cart" data-product-id="${product.id}">
                Thêm
            </button>
        </article>
    `;
}