import { saveUser } from "../../utils/storage.js";

export function setupLogin({ onSuccess }) {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const displayNameInput = document.getElementById("display-name");
    const message = document.getElementById("login-message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const displayName = displayNameInput.value.trim();

        if (!email) {
            message.textContent = "Vui lòng nhập email để tiếp tục.";
            return;
        }

        const user = {
            email,
            displayName: displayName || email.split("@")[0],
        };

        saveUser(user);
        message.textContent = "Đăng nhập thành công.";
        onSuccess(user);
    });
}
