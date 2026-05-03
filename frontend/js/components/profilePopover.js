const PROFILE_STORAGE_KEY = "campusgo_user_profiles";

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function profileKey(user) {
    return user?.email || "guest@campusgo.vn";
}

function readProfiles() {
    try {
        return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}

function writeProfiles(profiles) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function getProfile(user) {
    const profiles = readProfiles();
    return {
        fullName: user?.name || "",
        studentId: "",
        phone: user?.phone || "",
        birthday: "",
        gender: "",
        faculty: "",
        major: "",
        className: "",
        dormRoom: "",
        emergencyName: "",
        emergencyPhone: "",
        foodPreference: "",
        allergies: "",
        deliveryNote: "",
        avatarUrl: "",
        favoriteGate: "",
        ...profiles[profileKey(user)],
    };
}

function saveProfile(user, profile) {
    const profiles = readProfiles();
    profiles[profileKey(user)] = profile;
    writeProfiles(profiles);
}

function getInitial(profile, user) {
    const source = profile.fullName || user?.email || "CampusGo";
    const words = String(source).split(/[\s@.]+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "CG";
}

function field(name, label, value, placeholder = "", type = "text") {
    return `
        <label>
            <span>${label}</span>
            <input name="${name}" type="${type}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder)}">
        </label>
    `;
}

function textarea(name, label, value, placeholder = "") {
    return `
        <label class="profile-field-wide">
            <span>${label}</span>
            <textarea name="${name}" rows="3" maxlength="220" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value || "")}</textarea>
        </label>
    `;
}

function renderProfileForm(profile, user) {
    const initial = getInitial(profile, user);
    const avatar = profile.avatarUrl
        ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="Avatar" onerror="this.remove()">`
        : `<span>${initial}</span>`;

    return `
        <div class="profile-popover__head">
            <div class="profile-avatar-preview">${avatar}</div>
            <div>
                <p class="profile-title">Hồ sơ cá nhân</p>
                <p class="profile-subtitle">${escapeHtml(user?.email || "guest@campusgo.vn")}</p>
            </div>
        </div>

        <form id="profile-form" class="profile-form">
            ${field("fullName", "Họ tên", profile.fullName, "Nguyễn Văn A")}
            ${field("studentId", "Mã sinh viên", profile.studentId, "24020092")}
            ${field("phone", "Số điện thoại", profile.phone, "090...")}
            ${field("birthday", "Ngày sinh", profile.birthday, "", "date")}
            <label>
                <span>Giới tính</span>
                <select name="gender">
                    <option value="">Chưa chọn</option>
                    <option value="Nam" ${profile.gender === "Nam" ? "selected" : ""}>Nam</option>
                    <option value="Nữ" ${profile.gender === "Nữ" ? "selected" : ""}>Nữ</option>
                    <option value="Khác" ${profile.gender === "Khác" ? "selected" : ""}>Khác</option>
                </select>
            </label>
            ${field("faculty", "Khoa/Viện", profile.faculty, "CNTT, Kinh tế...")}
            ${field("major", "Ngành", profile.major, "Kỹ thuật phần mềm")}
            ${field("className", "Lớp", profile.className, "K67...")}
            ${field("dormRoom", "KTX/Phòng", profile.dormRoom, "KTX A - P.503")}
            ${field("favoriteGate", "Cổng hay nhận đồ", profile.favoriteGate, "Cổng Tây, Nhà B...")}
            ${field("emergencyName", "Liên hệ khẩn cấp", profile.emergencyName, "Tên người thân")}
            ${field("emergencyPhone", "SĐT khẩn cấp", profile.emergencyPhone, "09...")}
            ${field("avatarUrl", "Link ảnh đại diện", profile.avatarUrl, "https://...")}
            ${textarea("foodPreference", "Khẩu vị thường dùng", profile.foodPreference, "Ít cay, ít hành, thích nước sốt riêng...")}
            ${textarea("allergies", "Dị ứng/kiêng món", profile.allergies, "Hải sản, đậu phộng, sữa...")}
            ${textarea("deliveryNote", "Ghi chú giao hàng mặc định", profile.deliveryNote, "Gọi trước khi tới, gửi bảo vệ nếu bận...")}
            <button class="btn btn--primary btn--full profile-save-btn" type="submit">Lưu hồ sơ</button>
            <p id="profile-save-message" class="profile-save-message"></p>
        </form>
    `;
}

export function setupProfilePopover(root, user) {
    const toggleBtn = root.querySelector("#profile-toggle-btn");
    const popover = root.querySelector("#profile-popover");
    const initialEl = root.querySelector("#profile-avatar-initial");
    if (!toggleBtn || !popover) return;

    function paintAvatar(profile) {
        const initial = getInitial(profile, user);
        if (initialEl) initialEl.textContent = initial;
        if (profile.avatarUrl) {
            toggleBtn.style.backgroundImage = `url("${profile.avatarUrl}")`;
            toggleBtn.classList.add("has-image");
        } else {
            toggleBtn.style.backgroundImage = "";
            toggleBtn.classList.remove("has-image");
        }
    }

    function openPopover() {
        const profile = getProfile(user);
        popover.innerHTML = renderProfileForm(profile, user);
        popover.style.display = "block";
        paintAvatar(profile);

        const form = popover.querySelector("#profile-form");
        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = new FormData(form);
            const nextProfile = Object.fromEntries(data.entries());
            saveProfile(user, nextProfile);
            paintAvatar(nextProfile);
            const message = popover.querySelector("#profile-save-message");
            if (message) message.textContent = "Đã lưu hồ sơ.";
        });
    }

    paintAvatar(getProfile(user));

    toggleBtn.onclick = (event) => {
        event.stopPropagation();
        if (popover.style.display === "none") openPopover();
        else popover.style.display = "none";
    };

    document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) {
            popover.style.display = "none";
        }
    });
}
