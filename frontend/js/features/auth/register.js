import { saveUser } from "../../utils/storage.js";
import { registerWithPassword } from "../../services/userService.js";

function isGmail(email = "") {
    return email.trim().toLowerCase().endsWith("@gmail.com");
}

export function setupRegister({ onSuccess }) {
    const panel = document.getElementById("register-panel");
    const openBtn = document.getElementById("show-register-btn");
    const closeBtn = document.getElementById("close-register-btn");
    const form = document.getElementById("register-form");
    const message = document.getElementById("login-message");

    if (!panel || !openBtn || !form) return;

    openBtn.addEventListener("click", () => {
        panel.hidden = false;
        message.textContent = "";
        document.getElementById("register-name")?.focus();
    });

    closeBtn?.addEventListener("click", () => {
        panel.hidden = true;
        message.textContent = "";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "";

        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");
        const confirmPassword = String(formData.get("confirmPassword") || "");

        if (!name || !email || !password || !confirmPassword) {
            message.textContent = "Vui lòng nhập đầy đủ thông tin đăng ký.";
            return;
        }

        if (!isGmail(email)) {
            message.textContent = "Phần đăng ký hiện ưu tiên Gmail, ví dụ ban@gmail.com.";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Mật khẩu nên có ít nhất 6 ký tự.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Hai lần nhập mật khẩu chưa khớp.";
            return;
        }

        try {
            message.textContent = "Đang tạo tài khoản...";
            const user = await registerWithPassword({ name, email, password });
            saveUser(user);
            message.textContent = "Đăng ký thành công, CampusGo đã mở tài khoản cho bạn.";
            form.reset();
            panel.hidden = true;
            onSuccess?.(user);
        } catch (error) {
            message.textContent = error?.message || "Đăng ký thất bại, vui lòng thử lại.";
        }
    });
}
