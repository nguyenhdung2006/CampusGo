export function renderNavbar(user) {
    return `
        <nav class="navbar">
            <div class="navbar__brand">
                <strong>CampusGo</strong>
                <span>Demo dịch vụ nội bộ cho sinh viên</span>
            </div>

            <div class="navbar__user">
                <span>${user?.email || "guest@campusgo.vn"}</span>

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

                        <!-- DANH SÁCH PHỤ Ở TRÊN -->
                        <div id="address-list-nav" class="address-list-nav"></div>

                        <!-- Ô NHẬP Ở DƯỚI -->
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
