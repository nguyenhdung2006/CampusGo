import { getAddressBook, saveAddressBook } from "../utils/addressStorage.js";

export function setupAddressPopover(rootEl = document) {
    let toggleBtn = rootEl.querySelector("#address-toggle-btn");
    let popover = rootEl.querySelector("#address-popover");

    if (!toggleBtn || !popover) return;

    const freshToggle = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(freshToggle, toggleBtn);
    toggleBtn = freshToggle;

    const freshPopover = popover.cloneNode(true);
    popover.parentNode.replaceChild(freshPopover, popover);
    popover = freshPopover;

    // re-bind lại các node bên trong popover sau khi clone
    const defaultInput = rootEl.querySelector("#default-address-nav");
    const editDefaultBtn = rootEl.querySelector("#edit-default-address-btn");
    const newAddressInput = rootEl.querySelector("#new-address-nav");
    const addBtn = rootEl.querySelector("#add-address-nav-btn");
    const listEl = rootEl.querySelector("#address-list-nav");

    if (!defaultInput || !newAddressInput || !listEl) return;

    popover.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    let state = getAddressBook();
    let editingDefault = false;

    function persist() {
        saveAddressBook(state);
    }

    function persistAndBroadcast() {
        persist();
        window.dispatchEvent(new CustomEvent("campusgo:address-updated", { detail: state }));
    }

    function setDefaultEditMode(isEditing) {
        editingDefault = isEditing;
        defaultInput.readOnly = !isEditing;
        defaultInput.classList.toggle("is-readonly", !isEditing);

        if (editDefaultBtn) {
            editDefaultBtn.textContent = isEditing ? "💾" : "✏️";
            editDefaultBtn.title = isEditing ? "Lưu địa chỉ mặc định" : "Sửa địa chỉ mặc định";
        }

        if (isEditing) defaultInput.focus();
    }

    function saveDefaultAddress() {
        state.defaultAddress = defaultInput.value.trim();
        persistAndBroadcast();
        setDefaultEditMode(false);
    }

    function addExtraAddress() {
        const value = newAddressInput.value.trim();
        if (!value) return;

        state.extras.push(value);
        newAddressInput.value = "";
        persistAndBroadcast();
        renderList();
        newAddressInput.focus();
    }

    function updateExtraAddress(idx, value) {
        state.extras[idx] = value;
        persistAndBroadcast();
        renderList();
    }

    function removeExtraAddress(idx) {
        state.extras.splice(idx, 1);
        persistAndBroadcast();
        renderList();
    }

    // hoán đổi địa chỉ phụ <-> mặc định
    function swapWithDefault(idx) {
        const oldDefault = (state.defaultAddress || "").trim();
        const picked = (state.extras[idx] || "").trim();
        if (!picked) return;

        state.defaultAddress = picked;

        if (oldDefault) {
            state.extras[idx] = oldDefault;
        } else {
            state.extras.splice(idx, 1);
        }

        persistAndBroadcast();
        renderList();
    }

    function toggleExtraEdit(btn) {
        const idx = Number(btn.dataset.index);
        const row = listEl.querySelector(`.extra-edit-row[data-index="${idx}"]`);
        if (!row) return;

        const input = row.querySelector(".extra-address-input");
        const editBtn = row.querySelector(".js-edit-extra");
        if (!input || !editBtn) return;

        const isReadonly = input.readOnly;

        if (isReadonly) {
            input.readOnly = false;
            input.classList.remove("is-readonly");
            editBtn.textContent = "💾";
            editBtn.title = "Lưu địa chỉ phụ";
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        } else {
            const value = input.value.trim();
            if (!value) return;
            updateExtraAddress(idx, value);
        }
    }

    function renderList() {
        // sync state mới nhất từ localStorage (mọi trang dùng chung)
        state = getAddressBook();

        defaultInput.value = state.defaultAddress || "";

        if (!state.extras.length) {
            listEl.innerHTML = `<p class="address-empty">Chưa có địa chỉ phụ</p>`;
            return;
        }

        listEl.innerHTML = state.extras
            .map(
                (addr, idx) => `
                <div class="extra-edit-row" data-index="${idx}">
                    <input
                        class="extra-address-input is-readonly"
                        type="text"
                        value="${addr.replace(/"/g, "&quot;")}"
                        readonly
                    />
                    <button class="icon-btn js-swap-default" data-index="${idx}" type="button" title="Đặt làm mặc định">🔄</button>
                    <button class="icon-btn js-edit-extra" data-index="${idx}" type="button" title="Sửa địa chỉ phụ">✏️</button>
                    <button class="icon-btn js-remove-address-nav" data-index="${idx}" type="button" title="Xóa địa chỉ phụ">✕</button>
                </div>
            `
            )
            .join("");
    }

    // Toggle popover
    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = popover.style.display !== "none";
        popover.style.display = isOpen ? "none" : "block";
        if (!isOpen) renderList();
    });

    // Click ngoài popover
    document.addEventListener("click", (e) => {
        if (!popover.contains(e.target) && !toggleBtn.contains(e.target)) {
            popover.style.display = "none";
            if (editingDefault) saveDefaultAddress();
        }
    });

    // Default address edit
    editDefaultBtn?.addEventListener("click", () => {
        if (!editingDefault) {
            setDefaultEditMode(true);
            return;
        }
        saveDefaultAddress();
    });

    defaultInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveDefaultAddress();
        }
    });

    // Add extra
    addBtn?.addEventListener("click", addExtraAddress);
    newAddressInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addExtraAddress();
        }
    });

    // Edit/remove/swap extra
    listEl.addEventListener("click", (e) => {
        const swapBtn = e.target.closest(".js-swap-default");
        if (swapBtn) {
            const idx = Number(swapBtn.dataset.index);
            swapWithDefault(idx);
            return;
        }

        const editBtn = e.target.closest(".js-edit-extra");
        if (editBtn) {
            toggleExtraEdit(editBtn);
            return;
        }

        const removeBtn = e.target.closest(".js-remove-address-nav");
        if (removeBtn) {
            const idx = Number(removeBtn.dataset.index);
            removeExtraAddress(idx);
        }
    });

    // Enter trong input địa chỉ phụ đang edit => save
    listEl.addEventListener("keydown", (e) => {
        const input = e.target.closest(".extra-address-input");
        if (!input) return;
        if (e.key !== "Enter") return;

        e.preventDefault();
        const row = input.closest(".extra-edit-row");
        const idx = Number(row?.dataset.index);
        const value = input.value.trim();
        if (!value) return;
        updateExtraAddress(idx, value);
    });

    // đồng bộ khi có nơi khác cập nhật address
    window.addEventListener("campusgo:address-updated", () => {
        renderList();
    });

    renderList();
    setDefaultEditMode(false);
}