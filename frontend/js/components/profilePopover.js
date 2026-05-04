import { updatePassword } from "../services/userService.js";
import { saveUser } from "../utils/storage.js";
import { addPasswordNotification } from "../utils/notifications.js";

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

function renderPasswordEntry(user) {
    const hasPassword = user?.hasPassword !== false;

    return `
        <section class="profile-password-card ${hasPassword ? "" : "is-needed"}">
            <div>
                <p class="profile-password-card__eyebrow">${hasPassword ? "Bảo mật đăng nhập" : "Cần cập nhật"}</p>
                <h3>${hasPassword ? "Mật khẩu đã thiết lập" : "Tạo mật khẩu đăng nhập"}</h3>
                <p>${hasPassword ? "Bạn có thể đổi mật khẩu đăng nhập bất cứ lúc nào." : "Tài khoản này chưa có mật khẩu riêng. Tạo mật khẩu để đăng nhập trực tiếp bằng email."}</p>
            </div>
            <button id="profile-password-open-btn" class="btn btn--secondary btn--full profile-password-open-btn" type="button">
                ${hasPassword ? "Cập nhật mật khẩu" : "Tạo mật khẩu"}
            </button>
        </section>
    `;
}

function renderPasswordPage(user) {
    const hasPassword = user?.hasPassword !== false;

    return `
        <section class="profile-password-page">
            <button id="profile-password-back-btn" class="btn btn--ghost profile-password-back-btn" type="button">← Quay lại hồ sơ</button>
            <p class="profile-password-card__eyebrow">Bảo mật đăng nhập</p>
            <h3>${hasPassword ? "Cập nhật mật khẩu" : "Tạo mật khẩu đăng nhập"}</h3>
            <p class="profile-password-page__copy">${hasPassword ? "Nhập mật khẩu cũ, sau đó đặt mật khẩu mới để bảo vệ tài khoản." : "Đặt mật khẩu mới để lần sau đăng nhập trực tiếp bằng email."}</p>

            <form id="profile-password-form" class="profile-password-form profile-password-form--page">
                ${
                    hasPassword
                        ? `<label>
                            <span>Mật khẩu hiện tại</span>
                            <input name="currentPassword" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu hiện tại" required>
                        </label>`
                        : ""
                }
                <label>
                    <span>${hasPassword ? "Mật khẩu mới" : "Mật khẩu"}</span>
                    <input name="newPassword" type="password" autocomplete="new-password" placeholder="Tối thiểu 6 ký tự" minlength="6" required>
                </label>
                <label>
                    <span>Nhập lại mật khẩu</span>
                    <input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu" minlength="6" required>
                </label>
                <button class="btn btn--primary btn--full profile-password-save-btn" type="submit">Lưu mật khẩu</button>
                <p id="profile-password-message" class="profile-save-message"></p>
            </form>
        </section>
    `;
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

            ${renderPasswordEntry(user)}

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

        ${renderPasswordEntry(user)}

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

export function setupProfilePopover(root, user, options = {}) {
    const toggleBtn = root.querySelector("#profile-toggle-btn");
    const popover = root.querySelector("#profile-popover");
    if (!toggleBtn || !popover) return;
    let activeUser = user;

    function paintAvatar(profile) {
        toggleBtn.style.backgroundImage = `url("${getAvatarSrc(profile)}")`;
        toggleBtn.classList.toggle("has-image", Boolean(profile.avatarUrl));
    }

    function bindPasswordForm() {
        const form = popover.querySelector("#profile-password-form");
        const message = popover.querySelector("#profile-password-message");
        if (!form) return;

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (message) message.textContent = "";

            const data = new FormData(form);
            const currentPassword = String(data.get("currentPassword") || "");
            const newPassword = String(data.get("newPassword") || "");
            const confirmPassword = String(data.get("confirmPassword") || "");

            if (newPassword.length < 6) {
                if (message) message.textContent = "Mật khẩu cần ít nhất 6 ký tự.";
                return;
            }

            if (newPassword !== confirmPassword) {
                if (message) message.textContent = "Hai lần nhập mật khẩu chưa khớp.";
                return;
            }

            try {
                if (message) message.textContent = "Đang lưu mật khẩu...";
                const updatedUser = await updatePassword({ currentPassword, newPassword });
                activeUser = { ...activeUser, ...updatedUser, hasPassword: true };
                saveUser(activeUser);
                addPasswordNotification(activeUser);

            if (options.onUserUpdated) {
                    options.onUserUpdated(activeUser, { openProfile: true });
                    return;
                }

                render("auto");
            } catch (error) {
                if (message) message.textContent = error?.message || "Không cập nhật được mật khẩu.";
            }
        });
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

            saveProfile(activeUser, nextProfile);
            paintAvatar(nextProfile);
            popover.innerHTML = renderProfileView(nextProfile, activeUser);
        });
    }

    function render(mode = "auto") {
        const profile = getProfile(activeUser);
        const hasRequiredProfile = Boolean(profile.fullName?.trim() && profile.studentId?.trim() && profile.phone?.trim());
        const shouldShowView = mode !== "edit" && (Boolean(profile.savedAt) || hasRequiredProfile);

        if (mode === "password") {
            popover.innerHTML = renderPasswordPage(activeUser);
            popover.style.display = "block";
            paintAvatar(profile);
            bindPasswordForm();
            return;
        }

        popover.innerHTML = shouldShowView
            ? renderProfileView(profile, activeUser)
            : renderProfileForm(profile, activeUser);
        popover.style.display = "block";
        paintAvatar(profile);

        if (shouldShowView) return;

        bindForm(profile);
    }

    paintAvatar(getProfile(activeUser));

    popover.addEventListener("click", (event) => {
        event.stopPropagation();

        const editBtn = event.target.closest("#profile-edit-btn");
        if (editBtn) {
            event.preventDefault();
            render("edit");
            return;
        }

        const passwordBtn = event.target.closest("#profile-password-open-btn");
        if (passwordBtn) {
            event.preventDefault();
            render("password");
            return;
        }

        const passwordBackBtn = event.target.closest("#profile-password-back-btn");
        if (passwordBackBtn) {
            event.preventDefault();
            render("auto");
        }
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
