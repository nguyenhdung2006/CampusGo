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

    let seenIds = new Set();
    let firstLoad = true;

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
            if (e?.status === 401 || e?.status === 403) {
                if (timer) clearInterval(timer);
                timer = null;
                if (msgEl) msgEl.textContent =
                    "Bạn chưa đăng nhập đúng STORE hoặc tài khoản STORE chưa được gán cửa hàng (owner_id).";
            }
            return;
        }

        const orders = [...pending, ...confirmed, ...processing];

        if (countEl) countEl.textContent = `${orders.length} đơn`;

        if (!orders.length) {
            root.innerHTML = `<div class="tag">Chưa có đơn nào cần xử lý</div>`;
            seenIds = new Set();
            firstLoad = false;
            return;
        }


        // detect new orders (so với lần polling trước)
        const currentIds = new Set(orders.map((o) => String(o.id)));
        const newOnes = orders.filter((o) => !seenIds.has(String(o.id)));

        // chỉ toast khi không phải lần load đầu
        if (!firstLoad && newOnes.length) {
            // Sort giảm dần để lấy đơn mới nhất trước (phòng khi API trả lộn thứ tự)
            newOnes.sort((a, b) => Number(b.id) - Number(a.id));

            const newest = newOnes[0];
            const customerName = newest.user?.name || "Khách";
            const text = `Có ${newOnes.length} đơn mới — #${newest.id} (${customerName})`;

            // message trong page + toast nổi
            if (msgEl) msgEl.textContent = text;
            showToast(text, {
                onClick: () => {
                    const target = document.getElementById(`order-${newest.id}`);
                    if (!target) return;

                    target.scrollIntoView({ behavior: "smooth", block: "start" });

                    // highlight nhẹ 1.5s
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

        root.innerHTML = orders.map((o) => {
            const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
            const customerName = o.user?.name || "Khách";
            return `
                <div class="restaurant-card" id="order-${o.id}" data-order-id="${o.id}" style="align-items: start;">
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