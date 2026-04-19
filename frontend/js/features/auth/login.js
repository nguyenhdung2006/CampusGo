import { saveUser } from "../../utils/storage.js";
import { loginWithGoogle, loginWithPassword } from "../../services/userService.js";

export function setupLogin({ onSuccess }) {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const message = document.getElementById("login-message");
    const googleBtn = document.getElementById("google-login-btn");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "";

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
        message.textContent = "Vui lòng nhập đầy đủ email và mật khẩu.";
        return;
        }

        try {
        const user = await loginWithPassword(email, password);
        saveUser(user);
        message.textContent = "Đăng nhập thành công.";
        onSuccess(user);
        } catch (e) {
        message.textContent = e?.message || "Đăng nhập thất bại.";
        }
    });

    googleBtn?.addEventListener("click", () => {
        loginWithGoogle();
    });
}