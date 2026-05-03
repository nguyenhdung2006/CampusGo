import { createItem } from "../../services/marketplaceService.js";

let handlers = {};

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024;

function replaceImageUrlWithFileInput(form) {
    const imageUrlInput = form.imageUrl;
    const imageLabel = imageUrlInput?.closest("label");
    if (!imageLabel || imageLabel.dataset.fileReady === "true") return;

    imageLabel.dataset.fileReady = "true";
    imageLabel.innerHTML = `
        Ảnh sản phẩm
        <input name="imageFile" type="file" accept="image/*">
        <span class="mp-file-hint">Chọn ảnh thật của món đồ, tối đa khoảng 1.5MB.</span>
        <img id="marketplace-image-preview" class="mp-image-preview" alt="Xem trước ảnh sản phẩm" hidden>
    `;

    const fileInput = form.imageFile;
    const preview = document.getElementById("marketplace-image-preview");

    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!preview) return;

        if (!file) {
            preview.hidden = true;
            preview.removeAttribute("src");
            return;
        }

        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
    });
}

function ensureCreateItemEnhancements(form) {
    if (!form || form.dataset.enhanced === "true") return;
    form.dataset.enhanced = "true";
    replaceImageUrlWithFileInput(form);

    form.title?.closest("label")?.insertAdjacentHTML("afterend", `
        <div class="mp-form-grid">
            <label>Nhóm đồ
                <select name="category" required>
                    <option value="">Chọn nhóm đồ</option>
                    <option value="BOOKS">Sách, giáo trình</option>
                    <option value="TECH">Đồ công nghệ</option>
                    <option value="DORM">Đồ phòng trọ</option>
                    <option value="FASHION">Quần áo</option>
                    <option value="BIKE">Xe đạp, xe máy</option>
                    <option value="OTHER">Khác</option>
                </select>
            </label>
            <label>Tình trạng
                <select name="conditionLabel" required>
                    <option value="">Chọn tình trạng</option>
                    <option value="NEW">Mới/như mới</option>
                    <option value="GOOD">Còn tốt</option>
                    <option value="USED">Đã dùng ổn</option>
                    <option value="NEED_FIX">Cần sửa nhẹ</option>
                </select>
            </label>
        </div>
    `);

    form.price?.closest("label")?.insertAdjacentHTML("afterend", `
        <div class="mp-form-grid">
            <label>Điểm hẹn
                <input name="pickupLocation" required maxlength="120" placeholder="Cổng A, thư viện, KTX...">
            </label>
            <label>Cách giao dịch
                <select name="tradeMethod">
                    <option value="MEETUP">Hẹn gặp trong campus</option>
                    <option value="DELIVERY">Nhờ ship nội bộ</option>
                    <option value="BOTH">Gặp trực tiếp hoặc ship</option>
                </select>
            </label>
        </div>
    `);

    form.phone?.closest("label")?.insertAdjacentHTML("afterend", `
        <label class="mp-checkbox"><input name="negotiable" type="checkbox"> Có thể thương lượng cho sinh viên</label>
    `);
}

function readImageFile(form) {
    const file = form.imageFile?.files?.[0];
    if (!file) return Promise.resolve("");

    if (!file.type.startsWith("image/")) {
        return Promise.reject(new Error("Vui lòng chọn đúng file ảnh."));
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return Promise.reject(new Error("Ảnh hơi lớn, vui lòng chọn ảnh dưới 1.5MB."));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Không đọc được ảnh, vui lòng chọn ảnh khác."));
        reader.readAsDataURL(file);
    });
}

async function readItemForm(form) {
    const imageUrl = await readImageFile(form);

    return {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        price: Number(form.price.value || 0),
        imageUrl,
        phone: form.phone.value.trim(),
        category: form.category?.value || "OTHER",
        conditionLabel: form.conditionLabel?.value || "USED",
        pickupLocation: form.pickupLocation?.value.trim() || "Campus",
        tradeMethod: form.tradeMethod?.value || "MEETUP",
        negotiable: Boolean(form.negotiable?.checked),
    };
}

function validateItem(data) {
    if (!data.title) return "Vui lòng nhập tiêu đề sản phẩm.";
    if (!data.category) return "Vui lòng chọn nhóm đồ để người mua lọc nhanh.";
    if (!data.conditionLabel) return "Vui lòng chọn tình trạng món đồ.";
    if (!Number.isFinite(data.price) || data.price <= 0) return "Giá bán phải lớn hơn 0.";
    if (!data.pickupLocation) return "Vui lòng nhập điểm hẹn trong campus.";
    if (!data.phone) return "Vui lòng nhập số điện thoại liên hệ.";
    if (!/^[0-9+\s().-]{8,20}$/.test(data.phone)) return "Số điện thoại chưa đúng định dạng.";
    return "";
}

export function resetCreateItemForm() {
    const form = document.getElementById("create-item-form");
    const msg = document.getElementById("create-item-message");
    form?.reset();
    const preview = document.getElementById("marketplace-image-preview");
    if (preview) {
        preview.hidden = true;
        preview.removeAttribute("src");
    }
    if (msg) msg.textContent = "";
}

export function setupCreateItemForm({ user, onCreated, onCancel } = {}) {
    handlers = { user, onCreated, onCancel };

    const form = document.getElementById("create-item-form");
    const msg = document.getElementById("create-item-message");
    const backBtn = document.getElementById("back-to-marketplace-btn-3");

    if (!form) return;
    ensureCreateItemEnhancements(form);

    if (form.dataset.bound !== "true") {
        form.dataset.bound = "true";

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (msg) msg.textContent = "";

            let data;
            try {
                data = await readItemForm(form);
            } catch (error) {
                if (msg) msg.textContent = error?.message || "Không đọc được ảnh sản phẩm.";
                return;
            }

            const error = validateItem(data);
            if (error) {
                if (msg) msg.textContent = error;
                return;
            }

            if (handlers.user?.id) {
                data.seller = {
                    id: Number(handlers.user.id),
                    name: handlers.user.displayName || handlers.user.name,
                    email: handlers.user.email,
                };
            }

            if (msg) msg.textContent = "Đang đăng sản phẩm...";

            try {
                const posted = await createItem(data);
                if (msg) {
                    msg.textContent = posted?.isLocal
                        ? "Backend đang offline, tin đã lưu tạm và sẽ đồng bộ khi kết nối lại."
                        : "Đăng sản phẩm thành công.";
                }
                form.reset();
                const preview = document.getElementById("marketplace-image-preview");
                if (preview) {
                    preview.hidden = true;
                    preview.removeAttribute("src");
                }
                handlers.onCreated?.(posted);
            } catch (error) {
                if (msg) msg.textContent = error?.message || "Đăng sản phẩm thất bại.";
            }
        });
    }

    if (backBtn && backBtn.dataset.bound !== "true") {
        backBtn.dataset.bound = "true";
        backBtn.addEventListener("click", () => handlers.onCancel?.());
    }
}
