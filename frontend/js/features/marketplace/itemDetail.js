import { deleteItem, getItemDetail } from "../../services/marketplaceService.js";

function formatPrice(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString("vi-VN")}₫` : "Liên hệ";
}

function safeImage(src) {
    if (!src) return "./assets/images/hqdefault.jpg";
    if (src.startsWith("./") || src.startsWith("/") || src.startsWith("data:image/")) return src;
    if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(src)) return src;
    return "./assets/images/hqdefault.jpg";
}

export function renderMarketplaceItemDetail(item, currentUser) {
    if (!item) {
        return `<p class="empty-text">Sản phẩm không tồn tại.</p>`;
    }

    const sellerName = item.seller?.name || item.seller?.email || "Người bán CampusGo";
    const isMine = currentUser && item.seller?.id && Number(currentUser.id) === Number(item.seller.id);

    return `
        <article class="mp-detail-card">
            <img class="mp-detail-image" src="${safeImage(item.imageUrl)}" alt="${item.title}">
            <div class="mp-detail-info">
                <div class="mp-detail-topline">
                    <span class="tag">${item.status === "AVAILABLE" ? "Còn bán" : "Đã bán"}</span>
                    ${isMine ? `<span class="tag tag--soft">Bài của bạn</span>` : ""}
                </div>
                <h3>${item.title}</h3>
                <p class="mp-detail-price">${formatPrice(item.price)}</p>
                <p class="mp-detail-desc">${item.description || "Người bán chưa thêm mô tả."}</p>
                <div class="mp-contact-box">
                    <p><strong>Người bán:</strong> ${sellerName}</p>
                    <p><strong>SĐT:</strong> <span id="phone-copy">${item.phone || "--"}</span></p>
                    <button class="btn btn--secondary" id="copy-phone-btn" type="button">Sao chép SĐT</button>
                </div>
                ${
                    isMine
                        ? `<button class="btn btn--ghost" id="delete-marketplace-item-btn" type="button">Xóa bài đăng</button>`
                        : ""
                }
            </div>
        </article>
    `;
}

export async function loadMarketplaceItemDetail(id, { currentUser, onDeleted } = {}) {
    const detailArea = document.getElementById("marketplace-item-detail");
    if (!detailArea) return null;

    detailArea.innerHTML = `<p class="empty-text">Đang tải sản phẩm...</p>`;

    try {
        const item = await getItemDetail(id);
        detailArea.innerHTML = renderMarketplaceItemDetail(item, currentUser);

        document.getElementById("copy-phone-btn")?.addEventListener("click", async () => {
            const phone = item.phone || "";
            if (!phone) return;
            await navigator.clipboard?.writeText(phone);
        });

        document.getElementById("delete-marketplace-item-btn")?.addEventListener("click", async () => {
            if (!window.confirm("Xóa bài đăng này?")) return;
            await deleteItem(item.id, currentUser?.id);
            onDeleted?.();
        });

        return item;
    } catch (error) {
        detailArea.innerHTML = `<p class="empty-text">Không tải được sản phẩm. Vui lòng thử lại.</p>`;
        return null;
    }
}
