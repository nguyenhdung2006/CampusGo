import { deleteItem, getItemDetail, updateItem } from "../../services/marketplaceService.js";

const categoryLabels = {
    BOOKS: "Sách, giáo trình",
    TECH: "Đồ công nghệ",
    DORM: "Đồ phòng trọ",
    FASHION: "Quần áo",
    BIKE: "Xe đạp, xe máy",
    OTHER: "Khác",
};

const conditionLabels = {
    NEW: "Mới/như mới",
    GOOD: "Còn tốt",
    USED: "Đã dùng ổn",
    NEED_FIX: "Cần sửa nhẹ",
};

const tradeLabels = {
    MEETUP: "Hẹn gặp trong campus",
    DELIVERY: "Nhờ ship nội bộ",
    BOTH: "Gặp trực tiếp hoặc ship",
};

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
    return String(value).trim().toLowerCase();
}

function formatPrice(value) {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString("vi-VN")}đ` : "Liên hệ";
}

function safeImage(src) {
    if (!src) return "./assets/images/hqdefault.jpg";
    if (src.startsWith("./") || src.startsWith("/") || src.startsWith("data:image/")) return src;
    if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(src)) return src;
    return "./assets/images/hqdefault.jpg";
}

function cleanPhone(phone = "") {
    return String(phone).replace(/[^\d+]/g, "");
}

function getSellerName(item) {
    return item.seller?.name || item.seller?.displayName || item.seller?.email || "Người bán CampusGo";
}

function getSellerEmail(item) {
    return item.seller?.email || "";
}

function isMyItem(item, currentUser) {
    if (!currentUser || !item?.seller) return false;

    const sellerId = item.seller.id;
    const currentId = currentUser.id;
    if (sellerId && currentId && Number(sellerId) === Number(currentId)) return true;

    const sellerEmail = normalizeText(item.seller.email);
    const currentEmail = normalizeText(currentUser.email);
    if (sellerEmail && currentEmail && sellerEmail === currentEmail) return true;

    return false;
}

function getStatusLabel(item) {
    return item.status === "SOLD" ? "Đã bán" : "Còn bán";
}

export function renderMarketplaceItemDetail(item, currentUser, favorites = new Set()) {
    if (!item) {
        return `<p class="empty-text">Sản phẩm không tồn tại.</p>`;
    }

    const sellerName = getSellerName(item);
    const sellerEmail = getSellerEmail(item);
    const mine = isMyItem(item, currentUser);
    const favorite = favorites.has(String(item.id));
    const phone = item.phone || "";
    const phoneHref = cleanPhone(phone);
    const nextStatus = item.status === "SOLD" ? "AVAILABLE" : "SOLD";

    return `
        <article class="mp-detail-card ${item.status === "SOLD" ? "is-sold" : ""}">
            <div class="mp-detail-media">
                <img class="mp-detail-image" src="${escapeHtml(safeImage(item.imageUrl))}" alt="${escapeHtml(item.title)}">
            </div>

            <div class="mp-detail-info">
                <div class="mp-detail-topline">
                    <span class="tag ${item.status === "SOLD" ? "tag--sold" : ""}">${getStatusLabel(item)}</span>
                    <span class="tag tag--soft">${escapeHtml(categoryLabels[item.category] || item.category || "Chưa phân loại")}</span>
                    <span class="tag tag--soft">${escapeHtml(conditionLabels[item.conditionLabel] || item.conditionLabel || "Chưa rõ tình trạng")}</span>
                    ${item.negotiable ? `<span class="tag tag--soft">Có thương lượng</span>` : ""}
                    ${mine ? `<span class="tag tag--soft">Bài của bạn</span>` : ""}
                </div>

                <div class="mp-detail-main">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p class="mp-detail-price">${formatPrice(item.price)}</p>
                    <p class="mp-detail-desc">${escapeHtml(item.description || "Người bán chưa thêm mô tả.")}</p>
                </div>

                <div class="mp-info-grid">
                    <div>
                        <span>Điểm hẹn</span>
                        <strong>${escapeHtml(item.pickupLocation || "Hẹn trong campus")}</strong>
                    </div>
                    <div>
                        <span>Cách giao dịch</span>
                        <strong>${escapeHtml(tradeLabels[item.tradeMethod] || item.tradeMethod || "Tự thỏa thuận")}</strong>
                    </div>
                </div>

                <div class="mp-contact-box">
                    <div class="mp-box-head">
                        <strong>Liên hệ người bán</strong>
                        <span class="mp-seller-identity">
                            <b>${escapeHtml(sellerName)}</b>
                            ${sellerEmail ? `<small>${escapeHtml(sellerEmail)}</small>` : ""}
                        </span>
                    </div>
                    <p><strong>SĐT:</strong> <span id="phone-copy">${escapeHtml(phone || "--")}</span></p>
                    <div class="mp-contact-actions">
                        <button class="btn btn--secondary" id="copy-phone-btn" type="button">Copy SĐT</button>
                        ${phoneHref ? `<a class="btn btn--secondary" href="tel:${escapeHtml(phoneHref)}">Gọi ngay</a>` : ""}
                        ${phoneHref ? `<a class="btn btn--secondary" href="https://zalo.me/${escapeHtml(phoneHref)}" target="_blank" rel="noopener">Zalo</a>` : ""}
                    </div>
                </div>

                <div class="mp-detail-actions">
                    <button class="btn btn--secondary" id="favorite-detail-btn" type="button">${favorite ? "Bỏ lưu tin" : "Lưu tin"}</button>
                    <button class="btn btn--secondary" id="share-item-btn" type="button">Copy tin đăng</button>
                </div>

                ${
                    mine
                        ? `<div class="mp-owner-panel">
                            <div>
                                <strong>Quản lý bài đăng</strong>
                                <p>${item.status === "SOLD" ? "Bài này đang ở trạng thái đã bán. Bạn có thể mở bán lại nếu giao dịch chưa xong." : "Khi bán xong, chỉ cần đánh dấu đã bán để ẩn khỏi danh sách còn bán."}</p>
                            </div>
                            <div class="mp-owner-actions">
                                <button class="btn btn--primary" id="toggle-marketplace-status-btn" type="button" data-status="${nextStatus}">
                                    ${item.status === "SOLD" ? "Mở bán lại" : "Đánh dấu đã bán"}
                                </button>
                                <button class="btn btn--ghost" id="delete-marketplace-item-btn" type="button">Xóa bài đăng</button>
                            </div>
                        </div>`
                        : ""
                }

                <p id="marketplace-detail-message" class="form-message"></p>
            </div>
        </article>
    `;
}

function buildShareText(item) {
    return `${item.title} - ${formatPrice(item.price)}\nĐịa điểm: ${item.pickupLocation || "Campus"}\nLiên hệ: ${item.phone || ""}`;
}

function bindDetailActions(item, options) {
    const { currentUser, favorites, onFavoriteChanged, onUpdated, onDeleted } = options;
    const detailArea = document.getElementById("marketplace-item-detail");
    const message = document.getElementById("marketplace-detail-message");

    document.getElementById("copy-phone-btn")?.addEventListener("click", async () => {
        const phone = item.phone || "";
        if (!phone) return;
        await navigator.clipboard?.writeText(phone);
        if (message) message.textContent = "Đã copy số điện thoại.";
    });

    document.getElementById("favorite-detail-btn")?.addEventListener("click", () => {
        onFavoriteChanged?.(item.id);
        const isSaved = favorites.has(String(item.id));
        detailArea.innerHTML = renderMarketplaceItemDetail(item, currentUser, favorites);
        bindDetailActions(item, options);
        const nextMessage = document.getElementById("marketplace-detail-message");
        if (nextMessage) nextMessage.textContent = isSaved ? "Đã lưu tin này." : "Đã bỏ lưu tin.";
    });

    document.getElementById("share-item-btn")?.addEventListener("click", async () => {
        await navigator.clipboard?.writeText(buildShareText(item));
        if (message) message.textContent = "Đã copy thông tin tin đăng.";
    });

    document.getElementById("toggle-marketplace-status-btn")?.addEventListener("click", async (event) => {
        const nextStatus = event.currentTarget.dataset.status;
        try {
            const updated = await updateItem(item.id, {
                ...item,
                status: nextStatus,
            });
            onUpdated?.(updated);
            detailArea.innerHTML = renderMarketplaceItemDetail(updated, currentUser, favorites);
            bindDetailActions(updated, options);
            const nextMessage = document.getElementById("marketplace-detail-message");
            if (nextMessage) nextMessage.textContent = nextStatus === "SOLD" ? "Đã chuyển bài sang trạng thái đã bán." : "Đã mở bán lại bài đăng.";
        } catch (error) {
            if (message) message.textContent = error?.message || "Không cập nhật được trạng thái bài đăng.";
        }
    });

    document.getElementById("delete-marketplace-item-btn")?.addEventListener("click", async () => {
        if (!window.confirm("Xóa bài đăng này? Hành động này không thể hoàn tác.")) return;

        try {
            await deleteItem(item.id);
            onDeleted?.();
        } catch (error) {
            if (message) message.textContent = error?.message || "Không xóa được bài đăng.";
        }
    });
}

export async function loadMarketplaceItemDetail(id, options = {}) {
    const detailArea = document.getElementById("marketplace-item-detail");
    if (!detailArea) return null;

    const normalizedOptions = {
        currentUser: null,
        favorites: new Set(),
        onFavoriteChanged: null,
        onUpdated: null,
        onDeleted: null,
        ...options,
    };

    detailArea.innerHTML = `<p class="empty-text">Đang tải sản phẩm...</p>`;

    try {
        const item = await getItemDetail(id);
        detailArea.innerHTML = renderMarketplaceItemDetail(item, normalizedOptions.currentUser, normalizedOptions.favorites);
        bindDetailActions(item, normalizedOptions);
        return item;
    } catch (error) {
        detailArea.innerHTML = `<p class="empty-text">Không tải được sản phẩm. Vui lòng thử lại.</p>`;
        return null;
    }
}
