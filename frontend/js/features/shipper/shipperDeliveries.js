import {
    claimDelivery,
    deliveredDelivery,
    getAvailableDeliveries,
    getMyDeliveries,
    pickedUpDelivery,
} from "../../services/shipperDeliveryService.js";

function money(n) {
    if (n == null) return "";
    try {
        return Number(n).toLocaleString("vi-VN") + "₫";
    } catch {
        return String(n);
    }
}

function renderDeliveryCard(d, mode) {
    const order = d.order || {};
    const orderId = order.id ?? "(?)";
    const address = order.deliveryAddress ?? "";
    const customerName = order.user?.name || "Khách";
    const total = order.totalPrice != null ? money(order.totalPrice) : "";

    let actions = "";
    if (mode === "available") {
        actions = `<button class="btn btn--primary js-claim" data-id="${d.id}">Nhận đơn</button>`;
    } else {
        const st = String(d.status || "").toUpperCase();
        if (st === "ASSIGNED") {
        actions = `<button class="btn btn--secondary js-pickedup" data-id="${d.id}">Đã lấy hàng</button>`;
        } else if (st === "PICKED_UP") {
        actions = `<button class="btn btn--primary js-delivered" data-id="${d.id}">Đã giao</button>`;
        } else {
            actions = `<span class="tag">${d.status || ""}</span>`;
        }
    }

    return `
    <article class="restaurant-card" style="align-items:start;">
        <div class="restaurant-meta" style="flex:1;">
        <h4>Delivery #${d.id} — Order #${orderId}</h4>
        <p class="restaurant-desc">Trạng thái: <b>${d.status || ""}</b></p>
        <p class="restaurant-desc">Khách: ${customerName}</p>
        <p class="restaurant-desc">Địa chỉ: ${address}</p>
        <p class="restaurant-desc">Tổng: <b>${total}</b></p>
        <div style="display:flex; gap:8px; margin-top:10px;">
            ${actions}
        </div>
        </div>
    </article>
    `;
}

export function setupShipperDeliveries({ onBackHome } = {}) {
    const availableCountEl = document.getElementById("shipper-available-count");
    const availableMsgEl = document.getElementById("shipper-available-message");
    const availableListEl = document.getElementById("shipper-available-list");

    const myCountEl = document.getElementById("shipper-my-count");
    const myMsgEl = document.getElementById("shipper-my-message");
    const myListEl = document.getElementById("shipper-my-list");
    const backBtn = document.getElementById("back-home-from-shipper-btn");

    if (backBtn) backBtn.onclick = () => onBackHome?.();

    let timer = null;

    async function load() {
    if (msgEl) msgEl.textContent = "";

    let available = [];
    let mine = [];

    try {
        [available, mine] = await Promise.all([getAvailableDeliveries(), getMyDeliveries()]);
    } catch (e) {
        if (msgEl) msgEl.textContent = "Không tải được danh sách: " + (e.message || e);

         // ✅ STOP polling để khỏi spam
        if (e?.status === 400 || e?.status === 401 || e?.status === 403) {
            if (timer) clearInterval(timer);
            timer = null;
        }

        return;
    }

    const totalCount = (available?.length || 0) + (mine?.length || 0);
    if (countEl) countEl.textContent = `${totalCount} đơn`;

    root.innerHTML = `
        <div class="food-panel" style="margin-bottom:12px;">
        <div class="panel-head">
            <h3>Đơn có thể nhận</h3>
            <span class="tag">${available.length} đơn</span>
        </div>
        <div class="restaurant-list">
            ${
            available.length
                ? available.map((d) => renderDeliveryCard(d, "available")).join("")
                : `<div class="tag">Chưa có đơn để nhận</div>`
            }
        </div>
        </div>

        <div class="food-panel">
        <div class="panel-head">
            <h3>Đơn của tôi</h3>
            <span class="tag">${mine.length} đơn</span>
        </div>
        <div class="restaurant-list">
            ${
            mine.length
                ? mine.map((d) => renderDeliveryCard(d, "mine")).join("")
                : `<div class="tag">Bạn chưa nhận đơn nào</div>`
            }
        </div>
        </div>
    `;

    // bind claim
    root.querySelectorAll(".js-claim").forEach((btn) => {
        btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Đang nhận...";
        try {
            await claimDelivery(id);
            await load();
        } catch (e) {
            alert("Nhận đơn lỗi: " + (e.message || e));
        } finally {
            btn.disabled = false;
            btn.textContent = "Nhận đơn";
        }
        };
    });

    // bind picked up
    root.querySelectorAll(".js-pickedup").forEach((btn) => {
        btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Đang cập nhật...";
        try {
            await pickedUpDelivery(id);
            await load();
        } catch (e) {
            alert("Cập nhật lỗi: " + (e.message || e));
        } finally {
            btn.disabled = false;
            btn.textContent = "Đã lấy hàng";
        }
        };
    });

    // bind delivered
    root.querySelectorAll(".js-delivered").forEach((btn) => {
        btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        btn.disabled = true;
        btn.textContent = "Đang cập nhật...";
        try {
            await deliveredDelivery(id);
            await load();
        } catch (e) {
            alert("Cập nhật lỗi: " + (e.message || e));
        } finally {
            btn.disabled = false;
            btn.textContent = "Đã giao";
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