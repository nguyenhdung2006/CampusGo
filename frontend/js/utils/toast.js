function ensureToastRoot(position = "top-right") {
    let root = document.getElementById("app-toast-root");
    if (root) return root;

    root = document.createElement("div");
    root.id = "app-toast-root";
    root.className = `toast-root toast-root--${position}`;
    document.body.appendChild(root);
    return root;
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function showToast({
    title,
    description = "",
    type = "success",
    position = "top-right",
    duration = 4000,
} = {}) {
    if (!title) return null;

    const root = ensureToastRoot(position);
    const toast = document.createElement("div");
    toast.className = `app-toast app-toast--${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `
        <div class="app-toast__mark" aria-hidden="true"></div>
        <div class="app-toast__content">
            <strong>${escapeHtml(title)}</strong>
            ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        </div>
        <button class="app-toast__close" type="button" aria-label="Close notification">x</button>
    `;

    const close = () => {
        toast.classList.add("is-leaving");
        window.setTimeout(() => {
            toast.remove();
            if (!root.childElementCount) root.remove();
        }, 180);
    };

    toast.querySelector(".app-toast__close")?.addEventListener("click", close);
    root.appendChild(toast);
    window.setTimeout(close, duration);
    return toast;
}
