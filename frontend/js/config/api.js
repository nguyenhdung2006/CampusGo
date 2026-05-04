export const API_BASE_URL = "http://localhost:8080";

async function parseJsonSafe(res) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export function getApiErrorMessage(status, fallback = "") {
    if (status === 401) return "Please login";
    if (status === 403) return "You do not have permission";
    return fallback || "API request failed. Please try again.";
}

async function request(path, options = {}) {
    const { headers = {}, ...restOptions } = options;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...restOptions,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...headers },
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

        const err = new Error(getApiErrorMessage(res.status, message || `Request failed: ${res.status}`));
        err.status = res.status;
        throw err;
    }

    return parseJsonSafe(res);
}

async function requestWithMeta(path, options = {}) {
    const { headers = {}, ...restOptions } = options;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...restOptions,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...headers },
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

        const err = new Error(getApiErrorMessage(res.status, message || `Request failed: ${res.status}`));
        err.status = res.status;
        throw err;
    }

    return {
        data: await parseJsonSafe(res),
        status: res.status,
    };
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

export async function apiPostWithMeta(path, body) {
    return requestWithMeta(path, {
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
