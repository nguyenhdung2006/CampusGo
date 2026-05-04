import {
    formatNotificationTime,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
} from "../utils/notifications.js";

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderNotificationItems(user) {
    const items = getNotifications(user);

    if (!items.length) {
        return `
            <div class="notification-item notification-item--empty">
                <strong>Chưa có thông báo mới</strong>
                <p>Mọi cập nhật tài khoản quan trọng sẽ nằm ở đây.</p>
            </div>
        `;
    }

    return items
        .map((item) => `
            <button class="notification-item ${item.read ? "is-read" : "is-unread"}" type="button" data-notification-id="${escapeHtml(item.id)}">
                <span class="notification-item__dot" aria-hidden="true"></span>
                <span class="notification-item__content">
                    <strong>${escapeHtml(item.title)}</strong>
                    <p>${escapeHtml(item.body)}</p>
                    <small>${escapeHtml(formatNotificationTime(item.createdAt))}</small>
                </span>
            </button>
        `)
        .join("");
}

export function renderNavbar(user) {
    const unreadCount = getUnreadNotificationCount(user);

    return `
        <nav class="navbar">
            <div class="navbar__brand">
                <strong>CampusGo</strong>
                <span>Demo dịch vụ nội bộ cho sinh viên</span>
            </div>

            <div class="navbar__user">
                <span>${escapeHtml(user?.email || "guest@campusgo.vn")}</span>

                <div class="notification-popover-wrap">
                    <button id="notification-toggle-btn" class="notification-btn ${unreadCount ? "has-unread" : ""}" type="button" aria-label="Thông báo">
                        <svg class="notification-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
                            <path d="M13.7 21a2 2 0 0 1-3.4 0"></path>
                        </svg>
                    </button>

                    <div id="notification-popover" class="notification-popover" style="display:none;">
                        <p class="notification-popover__title">Thông báo</p>
                        <div id="notification-list" class="notification-list">
                            ${renderNotificationItems(user)}
                        </div>
                    </div>
                </div>

                <div class="profile-popover-wrap">
                    <button id="profile-toggle-btn" class="profile-avatar-btn" type="button" aria-label="Hồ sơ cá nhân">
                        <span id="profile-avatar-initial" aria-hidden="true"></span>
                    </button>

                    <div id="profile-popover" class="profile-popover" style="display:none;"></div>
                </div>

                <div class="address-popover-wrap">
                    <button id="address-toggle-btn" class="btn btn--secondary nav-action-btn address-toggle-btn" type="button">
                        📍 Địa chỉ
                    </button>

                    <div id="address-popover" class="address-popover" style="display:none;">
                        <p class="address-popover__title">Địa chỉ giao hàng</p>

                        <label for="default-address-nav">Mặc định <span class="required">*</span></label>
                        <div class="default-address-row">
                            <input id="default-address-nav" type="text" placeholder="Nhập địa chỉ mặc định..." />
                            <button id="edit-default-address-btn" class="icon-btn" type="button" title="Sửa địa chỉ mặc định">✏️</button>
                        </div>

                        <label for="new-address-nav" class="sub-label">Địa chỉ phụ</label>

                        <div id="address-list-nav" class="address-list-nav"></div>

                        <div class="address-add-row">
                            <input id="new-address-nav" type="text" placeholder="Nhập địa chỉ phụ rồi nhấn Enter..." />
                            <button id="add-address-nav-btn" class="icon-btn" type="button">+</button>
                        </div>
                    </div>
                </div>

                <button id="logout-btn" class="btn btn--ghost nav-action-btn">Đăng xuất</button>
            </div>
        </nav>
    `;
}

export function setupNotificationPopover(root, user) {
    const toggleBtn = root.querySelector("#notification-toggle-btn");
    const popover = root.querySelector("#notification-popover");
    const list = root.querySelector("#notification-list");
    if (!toggleBtn || !popover || !list) return;

    function refresh() {
        list.innerHTML = renderNotificationItems(user);
        toggleBtn.classList.toggle("has-unread", getUnreadNotificationCount(user) > 0);
    }

    toggleBtn.onclick = (event) => {
        event.stopPropagation();
        popover.style.display = popover.style.display === "none" ? "block" : "none";
    };

    popover.addEventListener("click", (event) => {
        event.stopPropagation();
        const item = event.target.closest("[data-notification-id]");
        if (!item) return;

        markNotificationRead(item.dataset.notificationId);
        refresh();
    });

    document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) {
            popover.style.display = "none";
        }
    });
}
