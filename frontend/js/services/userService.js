import { API_BASE_URL, apiGet, apiPost } from "../config/api.js";
import { getUser } from "../utils/storage.js";

const LOCAL_AUTH_KEY = "campusgo-demo-auth-accounts";
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function normalizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

function mapUser(raw) {
    if (!raw) return null;

    const email = normalizeEmail(raw.email);
    const fallback = email.includes("@") ? email.split("@")[0] : "Bạn";

    return {
        id: raw.id,
        email,
        name: raw.name || raw.displayName || fallback,
        displayName: raw.name || raw.displayName || fallback,
        role: raw.role || "USER",
        hasPassword: Boolean(raw.hasPassword),
    };
}

function readLocalAccounts() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_AUTH_KEY) || "{}");
    } catch {
        return {};
    }
}

function writeLocalAccounts(accounts) {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(accounts));
}

function upsertLocalAccount(user, password = "") {
    const email = normalizeEmail(user?.email);
    if (!email) return null;

    const accounts = readLocalAccounts();
    const existing = accounts[email] || {};
    const next = {
        id: existing.id || user.id || Date.now(),
        email,
        name: user.name || user.displayName || existing.name || email.split("@")[0],
        role: user.role || existing.role || "USER",
        password: password || existing.password || "",
        hasPassword: Boolean(password || existing.password || user.hasPassword),
    };

    accounts[email] = next;
    writeLocalAccounts(accounts);
    return mapUser(next);
}

function validateEmail(email) {
    if (!EMAIL_PATTERN.test(email)) {
        throw new Error("Email chưa đúng định dạng. Ví dụ hợp lệ: ban@campusgo.vn");
    }
}

function validatePassword(password) {
    if (!password || password.length < 6) {
        throw new Error("Mật khẩu cần ít nhất 6 ký tự.");
    }
}

function createAuthError(message = "Please login") {
    const error = new Error(message);
    error.status = 401;
    return error;
}

async function verifySession({ cacheUser = true } = {}) {
    const user = mapUser(await apiGet("/auth/me"));
    if (!user?.email) throw createAuthError();
    if (cacheUser) upsertLocalAccount(user);
    return user;
}

function updatePasswordLocal({ currentPassword = "", newPassword }) {
    validatePassword(newPassword);

    const activeUser = getUser();
    if (!activeUser?.email) {
        throw createAuthError("Bạn cần đăng nhập trước khi tạo mật khẩu.");
    }

    const email = normalizeEmail(activeUser.email);
    const accounts = readLocalAccounts();
    const existing = accounts[email];

    if (activeUser.hasPassword && existing?.password && existing.password !== currentPassword) {
        throw new Error("Mật khẩu hiện tại không đúng.");
    }

    return upsertLocalAccount(activeUser, newPassword);
}

export async function loginWithPassword(email, password) {
    const cleanEmail = normalizeEmail(email);
    validateEmail(cleanEmail);
    validatePassword(password);

    await apiPost("/auth/login", { email: cleanEmail, password });
    const user = await verifySession();
    if (user?.hasPassword) upsertLocalAccount(user, password);
    return user;
}

export async function registerWithPassword({ name, email, password }) {
    const cleanEmail = normalizeEmail(email);
    validateEmail(cleanEmail);
    validatePassword(password);

    await apiPost("/auth/register", { name, email: cleanEmail, password });
    const user = await verifySession();
    upsertLocalAccount(user, password);
    return user;
}

export async function updatePassword({ currentPassword = "", newPassword }) {
    validatePassword(newPassword);

    try {
        await apiPost("/auth/password", { currentPassword, newPassword });
        const user = await verifySession();
        upsertLocalAccount(user, newPassword);
        return user;
    } catch (error) {
        if (error?.status === 404) return updatePasswordLocal({ currentPassword, newPassword });
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        return await verifySession();
    } catch (error) {
        if (error?.status === 401 || error?.status === 403) return null;
        return null;
    }
}

export async function logoutApi() {
    try {
        await apiPost("/auth/logout");
    } catch {
        // Local logout is handled by clearUser().
    }
}

export function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}
