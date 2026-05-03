function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

const FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22360%22%20height%3D%22360%22%20viewBox%3D%220%200%20360%20360%22%3E%3Crect%20width%3D%22360%22%20height%3D%22360%22%20rx%3D%2242%22%20fill%3D%22%23fff4d6%22%2F%3E%3Ccircle%20cx%3D%22180%22%20cy%3D%22164%22%20r%3D%2278%22%20fill%3D%22%23145049%22%20opacity%3D%220.15%22%2F%3E%3Ctext%20x%3D%22180%22%20y%3D%22194%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2264%22%20font-weight%3D%22900%22%20fill%3D%22%23c55b32%22%3ECG%3C%2Ftext%3E%3C%2Fsvg%3E";

function normalizeImagePath(path) {
    if (!path) return FALLBACK_IMG;
    if (path.startsWith("./assets/")) return `/frontend/${path.replace("./", "")}`;
    return path;
}

function escapeAttr(value = "") {
    return escapeHtml(value).replaceAll("\n", " ");
}

export function renderProductCard(product) {
    const imageSrc = normalizeImagePath(product.image);
    const imageCandidates = (product.imageCandidates?.length ? product.imageCandidates : [imageSrc, FALLBACK_IMG])
        .map(normalizeImagePath)
        .filter((src, index, list) => src && list.indexOf(src) === index);
    const fallbackImages = imageCandidates.slice(1).join("|");
    const description = product.description ? `<p class="product-card__desc">${escapeHtml(product.description)}</p>` : "";
    const soldCount = Number(product.purchaseCount || product.soldCount || 0);
    const rating = Number(product.rating || 0);
    const isRestaurantOpen = product.restaurantIsOpen !== false;
    const badge = !isRestaurantOpen
        ? "Quán nghỉ"
        : soldCount >= 70
            ? "Bán chạy"
            : rating >= 4.6
                ? "Được khen nhiều"
                : product.isNew
                    ? "Món mới"
                    : Number(product.prepMinutes || 0) <= 7
                        ? "Lên món nhanh"
                        : "Món ngon";
    const prepTime = product.prepTimeText || "8-12 phút";
    const prepLabel = product.prepLabel || "Bếp chuẩn";
    const buttonText = isRestaurantOpen ? "Thêm" : "Đang nghỉ";

    return `
        <article class="product-card ${isRestaurantOpen ? "" : "is-unavailable"}" data-product-id="${product.id}">
            <button class="product-card__image-btn js-preview-product" type="button" data-product-id="${escapeAttr(product.id)}" aria-label="Xem ${escapeAttr(product.name)}">
                <img class="product-card__image" src="${escapeAttr(imageSrc)}" alt="${escapeAttr(product.name)}" data-fallbacks="${escapeAttr(fallbackImages)}" data-fallback-index="0" onerror="const list=this.dataset.fallbacks?this.dataset.fallbacks.split('|'):[];const index=Number(this.dataset.fallbackIndex||0);if(index<list.length){this.dataset.fallbackIndex=String(index+1);this.src=list[index];}else{this.onerror=null;this.src='${FALLBACK_IMG}';}">
            </button>
            <div class="product-card__info">
                <div class="product-card__head">
                    <h4>${escapeHtml(product.name)}</h4>
                    <span class="food-mini-badge ${isRestaurantOpen ? "" : "is-closed"}">${escapeHtml(badge)}</span>
                </div>
                <p class="price">${product.price.toLocaleString("vi-VN")}đ</p>
                ${description}
                <p class="product-card__meta">
                    <span>Chuẩn bị ${escapeHtml(prepTime)}</span>
                    <span>${escapeHtml(prepLabel)}</span>
                    <span>${soldCount} lượt gọi</span>
                    <span>${rating.toFixed(1)}/5</span>
                </p>
            </div>
            <button class="btn btn--secondary js-add-to-cart" data-product-id="${product.id}" ${isRestaurantOpen ? "" : "disabled"}>
                ${buttonText}
            </button>
        </article>
    `;
}
