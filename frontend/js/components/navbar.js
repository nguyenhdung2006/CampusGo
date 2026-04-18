export function renderNavbar(user) {
    return `
        <nav class="navbar">
            <div class="navbar__brand">
                <strong>CampusGo</strong>
                <span>Demo dịch vụ nội bộ cho sinh viên</span>
            </div>

            <div class="navbar__user">
                <span>${user?.email || "guest@campusgo.vn"}</span>
                <button id="logout-btn" class="btn btn--ghost">Đăng xuất</button>
            </div>
        </nav>
    `;
}
