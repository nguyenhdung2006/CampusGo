const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

    const API_BASE_URL = isLocal
    ? "http://localhost:8080"
    : "https://YOUR_BACKEND_DOMAIN"; // đổi backend public của bạn

export async function apiGet(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function apiPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}