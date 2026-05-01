import { confirmOrder, getStoreOrdersByStatus, setPacked, setProcessing } from "../../services/storeOrderService.js";

function formatMoney(n) {
    try {
        return Number(n || 0).toLocaleString("vi-VN") + "₫";
    } catch {
        return `${n}₫`;
    }
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

    async function load() {
        if (msgEl) msgEl.textContent = "";

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
            if (msgEl) msgEl.textContent = "Không tải được đơn: " + (e.message || e);
            return;
        }

        const orders = [...pending, ...confirmed, ...processing];

        if (countEl) countEl.textContent = `${orders.length} đơn`;

        if (!orders.length) {
            root.innerHTML = `<div class="tag">Chưa có đơn nào cần xử lý</div>`;
            return;
        }

        root.innerHTML = orders.map((o) => {
            const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
            const customerName = o.user?.name || "Khách";
            return `
                <div class="restaurant-card" style="align-items: start;">
                    <div class="restaurant-meta" style="flex: 1;">
                        <h4>#${o.id} - ${customerName}</h4>
                        <p class="restaurant-desc">Trạng thái: <b>${o.status}</b></p>
                        <p class="restaurant-desc">Địa chỉ: ${o.deliveryAddress || ""}</p>
                        <p class="restaurant-desc">Số món: ${itemsCount} | Tổng: <b>${formatMoney(o.totalPrice)}</b></p>
                        <p class="restaurant-desc">Ghi chú: ${o.note || "(không có)"}</p>

                        <div style="display:flex; gap:8px; margin-top:10px;">
                            ${
                                o.status === "PENDING"
                                    ? `<button class="btn btn--primary js-confirm" data-id="${o.id}">Xác nhận</button>`
                                    : ""
                            }
                            ${
                                o.status === "CONFIRMED"
                                    ? `<button class="btn btn--secondary js-processing" data-id="${o.id}">Bắt đầu làm</button>`
                                    : ""
                            }
                            ${
                                o.status === "PROCESSING"
                                    ? `<button class="btn btn--secondary js-packed" data-id="${o.id}">Đóng gói xong</button>`
                                    : ""
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        root.querySelectorAll(".js-confirm").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                btn.disabled = true;
                btn.textContent = "Đang xác nhận...";
                try {
                    await confirmOrder(id);
                    await load();
                } catch (e) {
                    alert("Xác nhận lỗi: " + (e.message || e));
                } finally {
                    btn.disabled = false;
                    btn.textContent = "Xác nhận";
                }
            };
        });

        root.querySelectorAll(".js-processing").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                btn.disabled = true;
                btn.textContent = "Đang chuyển...";
                try {
                    await setProcessing(id);
                    await load();
                } catch (e) {
                    alert("Chuyển PROCESSING lỗi: " + (e.message || e));
                } finally {
                    btn.disabled = false;
                    btn.textContent = "Bắt đầu làm";
                }
            };
        });

        root.querySelectorAll(".js-packed").forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute("data-id");
                btn.disabled = true;
                btn.textContent = "Đang chuyển...";
                try {
                    await setPacked(id);
                    await load();
                } catch (e) {
                    alert("Chuyển PACKED lỗi: " + (e.message || e));
                } finally {
                    btn.disabled = false;
                    btn.textContent = "Đóng gói xong";
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