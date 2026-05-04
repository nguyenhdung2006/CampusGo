import { saveUser } from "../../utils/storage.js";
import { registerWithPassword } from "../../services/userService.js";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function isValidEmail(email = "") {
    return EMAIL_PATTERN.test(email.trim());
}

export function setupRegister({ onSuccess, onOpenRegister, onBackLogin }) {
    const openBtn = document.getElementById("show-register-btn");
    const backBtn = document.getElementById("back-to-login-btn");
    const form = document.getElementById("register-form");
    const loginMessage = document.getElementById("login-message");
    const message = document.getElementById("register-message");

    if (!openBtn || !form) return;

    openBtn.addEventListener("click", () => {
        if (loginMessage) loginMessage.textContent = "";
        if (message) message.textContent = "";
        onOpenRegister?.();
    });

    backBtn?.addEventListener("click", () => {
        if (message) message.textContent = "";
        onBackLogin?.();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (message) message.textContent = "";

        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");
        const confirmPassword = String(formData.get("confirmPassword") || "");

        if (!name || !email || !password || !confirmPassword) {
            if (message) message.textContent = "Vui lòng nhập đầy đủ thông tin đăng ký.";
            return;
        }

        if (!isValidEmail(email)) {
            if (message) message.textContent = "Email chưa đúng định dạng. Ví dụ hợp lệ: ban@campusgo.vn";
            return;
        }

        if (password.length < 6) {
            if (message) message.textContent = "Mật khẩu nên có ít nhất 6 ký tự.";
            return;
        }

        if (password !== confirmPassword) {
            if (message) message.textContent = "Hai lần nhập mật khẩu chưa khớp.";
            return;
        }

        try {
            if (message) message.textContent = "Đang tạo tài khoản...";
            const user = await registerWithPassword({ name, email, password });
            saveUser(user);
            if (message) message.textContent = "Đăng ký thành công. Mình đưa bạn vào CampusGo ngay đây.";
            form.reset();
            window.setTimeout(() => onSuccess?.(user), 550);
        } catch (error) {
            if (message) message.textContent = error?.message || "Đăng ký thất bại, vui lòng thử lại.";
        }
    });
}
