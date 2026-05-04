import {
    claimDelivery,
    deliveredDelivery,
    getAvailableDeliveries,
    getMyDeliveries,
    pickedUpDelivery,
} from "../../services/shipperDeliveryService.js";

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function money(value) {
    const amount = Number(value || 0);
    return amount ? `${amount.toLocaleString("vi-VN")}đ` : "";
}

function renderSkeletonList(count = 2) {
    return `
        <div class="skeleton-list" aria-label="Đang tải">
            ${Array.from({ length: count }, () => `<div class="skeleton-card"></div>`).join("")}
        </div>
    `;
}

function renderState({ title, text, retryClass = "" }) {
    return `
        <div class="ui-state">
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(text)}</p>
            ${retryClass ? `<button class="btn btn--secondary ${retryClass}" type="button">Thử lại</button>` : ""}
        </div>
    `;
}

function renderDeliveryCard(delivery, mode) {
    const order = delivery.order || {};
    const status = String(delivery.status || "").toUpperCase();
    const customerName = order.user?.name || order.user?.email || "Khách";
    const total = order.totalPrice != null ? money(order.totalPrice) : "";

    let actions = "";
    if (mode === "available") {
        actions = `<button class="btn btn--primary js-claim" data-id="${escapeHtml(delivery.id)}" type="button">Nhận đơn</button>`;
    } else if (status === "ASSIGNED") {
        actions = `<button class="btn btn--secondary js-pickedup" data-id="${escapeHtml(delivery.id)}" type="button">Đã lấy hàng</button>`;
    } else if (status === "PICKED_UP") {
        actions = `<button class="btn btn--primary js-delivered" data-id="${escapeHtml(delivery.id)}" type="button">Đã giao</button>`;
    } else {
        actions = `<span class="tag">${escapeHtml(delivery.status || "Đang cập nhật")}</span>`;
    }

    return `
        <article class="ops-order-card">
            <div class="ops-order-main">
                <div class="ops-order-title">
                    <h4>Delivery #${escapeHtml(delivery.id)} - Order #${escapeHtml(order.id ?? "?")}</h4>
                    <span class="ops-status-pill">${escapeHtml(delivery.status || "Đang cập nhật")}</span>
                </div>
                <div class="ops-detail-grid">
                    <div class="ops-detail">
                        <span>Khách</span>
                        <strong>${escapeHtml(customerName)}</strong>
                    </div>
                    ${total ? `
                        <div class="ops-detail">
                            <span>Tổng</span>
                            <strong>${escapeHtml(total)}</strong>
                        </div>
                    ` : ""}
                    <div class="ops-detail ops-detail--wide">
                        <span>Địa chỉ</span>
                        <strong>${escapeHtml(order.deliveryAddress || "Chưa có địa chỉ")}</strong>
                    </div>
                </div>
            </div>
            <div class="ops-card-actions">
                ${actions}
            </div>
        </article>
    `;
}

function renderList(container, items, mode, emptyText) {
    if (!container) return;
    container.innerHTML = items.length
        ? items.map((delivery) => renderDeliveryCard(delivery, mode)).join("")
        : renderState({ title: emptyText, text: "Danh sách sẽ tự cập nhật khi có đơn phù hợp." });
}

export function setupShipperDeliveries({ onBackHome } = {}) {
    const availableCountEl = document.getElementById("shipper-available-count");
    const availableMsgEl = document.getElementById("shipper-available-message");
    const availableListEl = document.getElementById("shipper-available-list");
    const myCountEl = document.getElementById("shipper-my-count");
    const myMsgEl = document.getElementById("shipper-my-message");
    const myListEl = document.getElementById("shipper-my-list");
    const backBtn = document.getElementById("back-home-from-shipper-btn");

    if (!availableListEl || !myListEl) return () => {};
    if (backBtn) backBtn.onclick = () => onBackHome?.();

    let timer = null;
    let loading = false;
    let hasRendered = false;

    async function load() {
        if (loading) return;
        loading = true;
        if (availableMsgEl) availableMsgEl.textContent = "";
        if (myMsgEl) myMsgEl.textContent = "";
        if (!hasRendered) {
            availableListEl.innerHTML = renderSkeletonList();
            myListEl.innerHTML = renderSkeletonList();
        }

        try {
            const [available, mine] = await Promise.all([
                getAvailableDeliveries(),
                getMyDeliveries(),
            ]);

            const safeAvailable = Array.isArray(available) ? available : [];
            const safeMine = Array.isArray(mine) ? mine : [];

            if (availableCountEl) availableCountEl.textContent = `${safeAvailable.length} đơn`;
            if (myCountEl) myCountEl.textContent = `${safeMine.length} đơn`;

            renderList(availableListEl, safeAvailable, "available", "Chưa có đơn để nhận");
            renderList(myListEl, safeMine, "mine", "Bạn chưa nhận đơn nào");
            hasRendered = true;
            bindActions();
        } catch (error) {
            const message = error?.message || "Không tải được danh sách đơn.";
            if (availableMsgEl) availableMsgEl.textContent = message;
            if (myMsgEl) myMsgEl.textContent = message;

            availableListEl.innerHTML = renderState({
                title: "Không tải được đơn có thể nhận",
                text: message,
                retryClass: "js-retry-shipper",
            });
            myListEl.innerHTML = renderState({
                title: "Không tải được đơn của tôi",
                text: message,
                retryClass: "js-retry-shipper",
            });
            hasRendered = true;

            document.querySelectorAll(".js-retry-shipper").forEach((btn) => {
                btn.addEventListener("click", load);
            });

            if ([400, 401, 403].includes(error?.status)) {
                if (timer) clearInterval(timer);
                timer = null;
            }
        } finally {
            loading = false;
        }
    }

    function setBusy(btn, text) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = text;
    }

    function clearBusy(btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || btn.textContent;
    }

    function bindActions() {
        availableListEl.querySelectorAll(".js-claim").forEach((btn) => {
            btn.onclick = async () => {
                setBusy(btn, "Đang nhận...");
                try {
                    await claimDelivery(btn.dataset.id);
                    await load();
                } catch (error) {
                    if (availableMsgEl) availableMsgEl.textContent = `Nhận đơn lỗi: ${error?.message || error}`;
                } finally {
                    clearBusy(btn);
                }
            };
        });

        myListEl.querySelectorAll(".js-pickedup").forEach((btn) => {
            btn.onclick = async () => {
                setBusy(btn, "Đang cập nhật...");
                try {
                    await pickedUpDelivery(btn.dataset.id);
                    await load();
                } catch (error) {
                    if (myMsgEl) myMsgEl.textContent = `Cập nhật lỗi: ${error?.message || error}`;
                } finally {
                    clearBusy(btn);
                }
            };
        });

        myListEl.querySelectorAll(".js-delivered").forEach((btn) => {
            btn.onclick = async () => {
                setBusy(btn, "Đang cập nhật...");
                try {
                    await deliveredDelivery(btn.dataset.id);
                    await load();
                } catch (error) {
                    if (myMsgEl) myMsgEl.textContent = `Cập nhật lỗi: ${error?.message || error}`;
                } finally {
                    clearBusy(btn);
                }
            };
        });
    }

    load();
    timer = setInterval(load, 5000);

    return () => {
        if (timer) clearInterval(timer);
    };
}
