import { createItem } from "../../services/marketplaceService.js";

let handlers = {};

function readItemForm(form) {
    return {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        price: Number(form.price.value || 0),
        imageUrl: form.imageUrl.value.trim(),
        phone: form.phone.value.trim(),
    };
}

function validateItem(data) {
    if (!data.title) return "Vui lòng nhập tiêu đề sản phẩm.";
    if (!Number.isFinite(data.price) || data.price <= 0) return "Giá bán phải lớn hơn 0.";
    if (!data.phone) return "Vui lòng nhập số điện thoại liên hệ.";
    return "";
}

export function resetCreateItemForm() {
    const form = document.getElementById("create-item-form");
    const msg = document.getElementById("create-item-message");
    form?.reset();
    if (msg) msg.textContent = "";
}

export function setupCreateItemForm({ user, onCreated, onCancel } = {}) {
    handlers = { user, onCreated, onCancel };

    const form = document.getElementById("create-item-form");
    const msg = document.getElementById("create-item-message");
    const backBtn = document.getElementById("back-to-marketplace-btn-3");

    if (!form || form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (msg) msg.textContent = "";

        const data = readItemForm(form);
        const error = validateItem(data);
        if (error) {
            if (msg) msg.textContent = error;
            return;
        }

        if (handlers.user?.id) {
            data.seller = { id: Number(handlers.user.id) };
        }

        if (msg) msg.textContent = "Đang đăng sản phẩm...";

        try {
            const posted = await createItem(data);
            if (msg) msg.textContent = "Đăng sản phẩm thành công.";
            form.reset();
            handlers.onCreated?.(posted);
        } catch (error) {
            if (msg) msg.textContent = error?.message || "Đăng sản phẩm thất bại.";
        }
    });

    backBtn?.addEventListener("click", () => handlers.onCancel?.());
}
