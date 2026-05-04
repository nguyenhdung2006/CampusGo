const API_BASE_URL = "http://localhost:8080";

function mapUser(raw) {
    if (!raw) return null;

    const email = raw.email || "";
    const fallback = email.includes("@") ? email.split("@")[0] : "Bạn";

    return {
        id: raw.id,
        email,
        displayName: raw.name || raw.displayName || fallback,
        role: raw.role || "USER",
    };
}

async function parseJsonSafe(res) {
    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export async function loginWithPassword(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        throw new Error("Sai email hoặc mật khẩu.");
    }

    const data = await parseJsonSafe(res);
    return mapUser(data);
}

export async function registerWithPassword({ name, email, password }) {
    const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name,
            email,
            password,
            role: "USER",
        }),
    });

    if (!res.ok) {
        throw new Error("Gmail này có thể đã được dùng hoặc thông tin đăng ký chưa hợp lệ.");
    }

    return loginWithPassword(email, password);
}

export async function getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) return null;

    const data = await parseJsonSafe(res);
    return mapUser(data);
}

export async function logoutApi() {
    await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
}

export function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}
