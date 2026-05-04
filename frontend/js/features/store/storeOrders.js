import { confirmOrder, getStoreOrdersByStatus, setPacked, setProcessing } from "../../services/storeOrderService.js";

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatMoney(n) {
    try {
        return `${Number(n || 0).toLocaleString("vi-VN")}đ`;
    } catch {
        return `${n}đ`;
    }
}

function renderSkeletonList(count = 3) {
    return `
        <div class="skeleton-list" aria-label="Đang tải">
            ${Array.from({ length: count }, () => `<div class="skeleton-card"></div>`).join("")}
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="ui-state">
            <strong>Chưa có đơn cần xử lý</strong>
            <p>Đơn mới, đơn đã xác nhận và đơn đang chuẩn bị sẽ xuất hiện ở đây.</p>
        </div>
    `;
}

function renderErrorState(message) {
    return `
        <div class="ui-state">
            <strong>Không tải được danh sách đơn</strong>
            <p>${escapeHtml(message)}</p>
            <button class="btn btn--secondary js-retry-store-orders" type="button">Thử lại</button>
        </div>
    `;
}

function renderOrderCard(order) {
    const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
    const customerName = order.user?.name || "Khách";
    const note = order.note || "(không có)";

    let actions = "";
    if (order.status === "PENDING") {
        actions = `<button class="btn btn--primary js-confirm" data-id="${escapeHtml(order.id)}" type="button">Xác nhận</button>`;
    } else if (order.status === "CONFIRMED") {
        actions = `<button class="btn btn--secondary js-processing" data-id="${escapeHtml(order.id)}" type="button">Bắt đầu làm</button>`;
    } else if (order.status === "PROCESSING") {
        actions = `<button class="btn btn--secondary js-packed" data-id="${escapeHtml(order.id)}" type="button">Đóng gói xong</button>`;
    }

    return `
        <article class="ops-order-card" id="order-${escapeHtml(order.id)}" data-order-id="${escapeHtml(order.id)}">
            <div class="ops-order-main">
                <div class="ops-order-title">
                    <h4>#${escapeHtml(order.id)} - ${escapeHtml(customerName)}</h4>
                    <span class="ops-status-pill">${escapeHtml(order.status || "Đang cập nhật")}</span>
                </div>
                <div class="ops-detail-grid">
                    <div class="ops-detail">
                        <span>Số món</span>
                        <strong>${itemsCount}</strong>
                    </div>
                    <div class="ops-detail">
                        <span>Tổng</span>
                        <strong>${escapeHtml(formatMoney(order.totalPrice))}</strong>
                    </div>
                    <div class="ops-detail ops-detail--wide">
                        <span>Địa chỉ</span>
                        <strong>${escapeHtml(order.deliveryAddress || "Chưa có địa chỉ")}</strong>
                    </div>
                    <div class="ops-detail ops-detail--wide">
                        <span>Ghi chú</span>
                        <strong>${escapeHtml(note)}</strong>
                    </div>
                </div>
            </div>
            <div class="ops-card-actions">
                ${actions || `<span class="tag">${escapeHtml(order.status || "Đang cập nhật")}</span>`}
            </div>
        </article>
    `;
}

export function setupStoreOrders({ onBackHome } = {}) {
    const root = document.getElementById("store-orders");
    const countEl = document.getElementById("store-order-count");
    const msgEl = document.getElementById("store-orders-message");
    const backBtn = document.getElementById("back-home-from-store-btn");

    if (backBtn) {
        backBtn.onclick = () => onBackHome?.();
    }

    let timer = null;
    let seenIds = new Set();
    let firstLoad = true;
    let hasRendered = false;

    function showToast(text, { onClick } = {}) {
        let wrap = document.getElementById("toast-root");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "toast-root";
            wrap.style.position = "fixed";
            wrap.style.top = "16px";
            wrap.style.right = "16px";
            wrap.style.zIndex = "9999";
            wrap.style.display = "flex";
            wrap.style.flexDirection = "column";
            wrap.style.gap = "8px";
            document.body.appendChild(wrap);
        }

        const el = document.createElement("div");
        el.textContent = text;
        el.style.background = "#1f2937";
        el.style.color = "#fff";
        el.style.padding = "10px 12px";
        el.style.borderRadius = "12px";
        el.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
        el.style.fontSize = "14px";
        el.style.maxWidth = "340px";
        el.style.cursor = "pointer";

        el.onclick = () => {
            try { onClick?.(); } catch {}
            el.remove();
        };

        wrap.appendChild(el);

        setTimeout(() => {
            el.remove();
            if (wrap && wrap.childElementCount === 0) wrap.remove();
        }, 3500);
    }

    function bindRetry() {
        root?.querySelector(".js-retry-store-orders")?.addEventListener("click", load);
    }

    async function load() {
        if (msgEl) msgEl.textContent = "";
        if (!hasRendered && root) root.innerHTML = renderSkeletonList();

        let pending = [];
        let confirmed = [];
        let processing = [];

        try {
            [pending, confirmed, processing] = await Promise.all([
                getStoreOrdersByStatus("PENDING"),
                getStoreOrdersByStatus("CONFIRMED"),
                getStoreOrdersByStatus("PROCESSING"),
            ]);
        } catch (e) {
            if (e?.status === 401 || e?.status === 403) {
                if (timer) clearInterval(timer);
                timer = null;
                if (msgEl) msgEl.textContent = "Bạn chưa đăng nhập đúng STORE hoặc tài khoản STORE chưa được gán cửa hàng.";
                if (root) root.innerHTML = renderErrorState("Vui lòng kiểm tra tài khoản cửa hàng rồi thử lại.");
            } else if (root) {
                root.innerHTML = renderErrorState(e?.message || String(e));
            }
            hasRendered = true;
            bindRetry();
            return;
        }

        const orders = [...pending, ...confirmed, ...processing];

        if (countEl) countEl.textContent = `${orders.length} đơn`;

        if (!orders.length) {
            if (root) root.innerHTML = renderEmptyState();
            seenIds = new Set();
            firstLoad = false;
            hasRendered = true;
            return;
        }

        const currentIds = new Set(orders.map((o) => String(o.id)));
        const newOnes = orders.filter((o) => !seenIds.has(String(o.id)));

        if (!firstLoad && newOnes.length) {
            newOnes.sort((a, b) => Number(b.id) - Number(a.id));

            const newest = newOnes[0];
            const customerName = newest.user?.name || "Khách";
            const text = `Có ${newOnes.length} đơn mới - #${newest.id} (${customerName})`;

            if (msgEl) msgEl.textContent = text;
            showToast(text, {
                onClick: () => {
                    const target = document.getElementById(`order-${newest.id}`);
                    if (!target) return;

                    target.scrollIntoView({ behavior: "smooth", block: "start" });

                    const oldBg = target.style.background;
                    target.style.transition = "background 0.2s ease";
                    target.style.background = "rgba(255, 217, 102, 0.35)";
                    setTimeout(() => {
                        target.style.background = oldBg || "";
                    }, 1500);
                },
            });
        }

        seenIds = currentIds;
        firstLoad = false;
        hasRendered = true;

        if (root) root.innerHTML = orders.map(renderOrderCard).join("");
        bindActions();
    }

    function setButtonBusy(btn, text) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = text;
    }

    function clearButtonBusy(btn, fallback) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || fallback;
    }

    function bindActions() {
        root?.querySelectorAll(".js-confirm").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                setButtonBusy(btn, "Đang xác nhận...");
                try {
                    await confirmOrder(id);
                    await load();
                } catch (e) {
                    if (msgEl) msgEl.textContent = `Xác nhận lỗi: ${e.message || e}`;
                } finally {
                    clearButtonBusy(btn, "Xác nhận");
                }
            };
        });

        root?.querySelectorAll(".js-processing").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                setButtonBusy(btn, "Đang chuyển...");
                try {
                    await setProcessing(id);
                    await load();
                } catch (e) {
                    if (msgEl) msgEl.textContent = `Chuyển PROCESSING lỗi: ${e.message || e}`;
                } finally {
                    clearButtonBusy(btn, "Bắt đầu làm");
                }
            };
        });

        root?.querySelectorAll(".js-packed").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                setButtonBusy(btn, "Đang chuyển...");
                try {
                    await setPacked(id);
                    await load();
                } catch (e) {
                    if (msgEl) msgEl.textContent = `Chuyển PACKED lỗi: ${e.message || e}`;
                } finally {
                    clearButtonBusy(btn, "Đóng gói xong");
                }
            };
        });
    }

    load();
    timer = setInterval(load, 3000);

    return () => {
        if (timer) clearInterval(timer);
    };
}
