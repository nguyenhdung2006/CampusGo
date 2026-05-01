const API_BASE_URL = "http://localhost:8080";

async function parseJsonSafe(res) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        credentials: "include",
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        let message = text;
        try {
            const body = JSON.parse(text);
            message = body.message || body.error || text;
        } catch {
            message = text;
        }
        throw new Error(message || `Request failed: ${res.status}`);
    }

    return parseJsonSafe(res);
}

export async function apiGet(path) {
    return request(path, { method: "GET" });
}

export async function apiPost(path, body) {
    return request(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function apiPut(path, body) {
    return request(path, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function apiDelete(path) {
    return request(path, { method: "DELETE" });
}
