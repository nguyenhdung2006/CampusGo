const PROFILE_STORAGE_KEY = "campusgo_user_profiles";
const DEFAULT_AVATAR_URL = "/frontend/assets/images/default-profile.svg";

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
        savedAt: "",
        ...profiles[profileKey(user)],
    };
}

function saveProfile(user, profile) {
    const profiles = readProfiles();
    profiles[profileKey(user)] = profile;
    writeProfiles(profiles);
}

export function getProfileDisplayName(user) {
    const profile = getProfile(user);
    return profile.fullName?.trim() || user?.name || user?.email || "Khách CampusGo";
}

function getAvatarSrc(profile) {
    return profile.avatarUrl || DEFAULT_AVATAR_URL;
}

function field(name, label, value, placeholder = "", type = "text", required = false) {
    return `
        <label>
            <span>${label}${required ? ' <b class="required">*</b>' : ""}</span>
            <input name="${name}" type="${type}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}>
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

function detail(label, value) {
    const clean = String(value || "").trim();
    if (!clean) return "";
    return `
        <div class="profile-detail">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(clean)}</strong>
        </div>
    `;
}

function chip(value) {
    const clean = String(value || "").trim();
    return clean ? `<span>${escapeHtml(clean)}</span>` : "";
}

function renderProfileView(profile, user) {
    const savedDetails = [
        detail("Mã sinh viên", profile.studentId),
        detail("Số điện thoại", profile.phone),
        detail("Ngày sinh", profile.birthday),
        detail("Giới tính", profile.gender),
        detail("Khoa/Viện", profile.faculty),
        detail("Ngành", profile.major),
        detail("Lớp", profile.className),
        detail("KTX/Phòng", profile.dormRoom),
        detail("Cổng hay nhận đồ", profile.favoriteGate),
        detail("Liên hệ khẩn cấp", profile.emergencyName),
        detail("SĐT khẩn cấp", profile.emergencyPhone),
    ].filter(Boolean);

    const preferenceChips = [
        chip(profile.foodPreference),
        chip(profile.allergies),
        chip(profile.deliveryNote),
    ].filter(Boolean);

    return `
        <section class="profile-view">
            <div class="profile-view__hero">
                <div class="profile-avatar-ring">
                    <img src="${escapeHtml(getAvatarSrc(profile))}" alt="Ảnh đại diện" onerror="this.src='${DEFAULT_AVATAR_URL}'">
                </div>
                <div class="profile-view__identity">
                    <p class="profile-title">${escapeHtml(profile.fullName || user?.name || "Hồ sơ cá nhân")}</p>
                    <p class="profile-subtitle">${escapeHtml(user?.email || "guest@campusgo.vn")}</p>
                </div>
            </div>

            <div class="profile-view__grid">
                ${savedDetails.join("")}
            </div>

            ${preferenceChips.length ? `
                <div class="profile-note-list">
                    ${preferenceChips.join("")}
                </div>
            ` : ""}

            <button id="profile-edit-btn" class="btn btn--primary btn--full profile-edit-btn" type="button">Chỉnh sửa hồ sơ</button>
        </section>
    `;
}

function renderProfileForm(profile, user) {
    return `
        <div class="profile-popover__head">
            <div class="profile-avatar-preview">
                <img id="profile-avatar-preview-img" src="${escapeHtml(getAvatarSrc(profile))}" alt="Ảnh đại diện" onerror="this.src='${DEFAULT_AVATAR_URL}'">
            </div>
            <div>
                <p class="profile-title">Hồ sơ cá nhân</p>
                <p class="profile-subtitle">${escapeHtml(user?.email || "guest@campusgo.vn")}</p>
            </div>
        </div>

        <form id="profile-form" class="profile-form">
            ${field("fullName", "Họ tên", profile.fullName, "Nguyễn Văn A", "text", true)}
            ${field("studentId", "Mã sinh viên", profile.studentId, "24020092", "text", true)}
            ${field("phone", "Số điện thoại", profile.phone, "090...", "tel", true)}
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

            <label class="profile-field-wide profile-avatar-field">
                <span>Ảnh đại diện</span>
                <input id="profile-avatar-input" type="file" accept="image/*">
                <input id="profile-avatar-url" name="avatarUrl" type="hidden" value="${escapeHtml(profile.avatarUrl || "")}">
            </label>

            ${textarea("foodPreference", "Khẩu vị thường dùng", profile.foodPreference, "Ít cay, ít hành, thích nước sốt riêng...")}
            ${textarea("allergies", "Dị ứng/kiêng món", profile.allergies, "Hải sản, đậu phộng, sữa...")}
            ${textarea("deliveryNote", "Ghi chú giao hàng mặc định", profile.deliveryNote, "Gọi trước khi tới, gửi bảo vệ nếu bận...")}
            <button class="btn btn--primary btn--full profile-save-btn" type="submit">Lưu hồ sơ</button>
            <p id="profile-save-message" class="profile-save-message"></p>
        </form>
    `;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export function setupProfilePopover(root, user) {
    const toggleBtn = root.querySelector("#profile-toggle-btn");
    const popover = root.querySelector("#profile-popover");
    if (!toggleBtn || !popover) return;

    function paintAvatar(profile) {
        toggleBtn.style.backgroundImage = `url("${getAvatarSrc(profile)}")`;
        toggleBtn.classList.toggle("has-image", Boolean(profile.avatarUrl));
    }

    function bindForm(profile) {
        const form = popover.querySelector("#profile-form");
        const fileInput = popover.querySelector("#profile-avatar-input");
        const hiddenAvatar = popover.querySelector("#profile-avatar-url");
        const previewImg = popover.querySelector("#profile-avatar-preview-img");

        fileInput?.addEventListener("change", async () => {
            const file = fileInput.files?.[0];
            if (!file) return;

            const dataUrl = await readFileAsDataUrl(file);
            hiddenAvatar.value = dataUrl;
            if (previewImg) previewImg.src = dataUrl;
        });

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const data = new FormData(form);
            const nextProfile = {
                ...profile,
                ...Object.fromEntries(data.entries()),
                savedAt: new Date().toISOString(),
            };

            saveProfile(user, nextProfile);
            paintAvatar(nextProfile);
            popover.innerHTML = renderProfileView(nextProfile, user);
        });
    }

    function render(mode = "auto") {
        const profile = getProfile(user);
        const hasRequiredProfile = Boolean(profile.fullName?.trim() && profile.studentId?.trim() && profile.phone?.trim());
        const shouldShowView = mode !== "edit" && (Boolean(profile.savedAt) || hasRequiredProfile);

        popover.innerHTML = shouldShowView
            ? renderProfileView(profile, user)
            : renderProfileForm(profile, user);
        popover.style.display = "block";
        paintAvatar(profile);

        if (shouldShowView) return;

        bindForm(profile);
    }

    paintAvatar(getProfile(user));

    popover.addEventListener("click", (event) => {
        event.stopPropagation();

        const editBtn = event.target.closest("#profile-edit-btn");
        if (!editBtn) return;

        event.preventDefault();
        render("edit");
    });

    toggleBtn.onclick = (event) => {
        event.stopPropagation();
        if (popover.style.display === "none") render();
        else popover.style.display = "none";
    };

    document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) {
            popover.style.display = "none";
        }
    });
}
