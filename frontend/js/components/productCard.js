export function renderProductCard(product) {
    const imageSrc = product.image || "./assets/images/hqdefault.jpg";
    const description = product.description ? `<p class="product-card__desc">${product.description}</p>` : "";

    return `
        <article class="product-card" data-product-id="${product.id}">
            <img class="product-card__image" src="${imageSrc}" alt="${product.name}">
            <div class="product-card__info">
                <h4>${product.name}</h4>
                <p class="price">${product.price.toLocaleString("vi-VN")}₫</p>
                ${description}
            </div>
            <button class="btn btn--secondary js-add-to-cart" data-product-id="${product.id}">
                Thêm
            </button>
        </article>
    `;
}
