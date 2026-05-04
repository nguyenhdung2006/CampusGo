const NOTIFICATION_KEY = "campusgo-demo-notifications";

function readAll() {
    try {
        return JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeAll(items) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(items));
}

export function getNotifications(user) {
    const email = String(user?.email || "").trim().toLowerCase();
    return readAll()
        .filter((item) => !email || item.email === email)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getUnreadNotificationCount(user) {
    return getNotifications(user).filter((item) => !item.read).length;
}

export function addPasswordNotification(user) {
    const email = String(user?.email || "").trim().toLowerCase();
    if (!email) return null;

    const notification = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: "PASSWORD_UPDATED",
        email,
        title: "Cập nhật mật khẩu thành công",
        body: `Mật khẩu đăng nhập cho tài khoản ${email} đã được cập nhật.`,
        createdAt: new Date().toISOString(),
        read: false,
    };

    writeAll([notification, ...readAll()]);
    return notification;
}

export function markNotificationRead(id) {
    const items = readAll();
    const next = items.map((item) => (String(item.id) === String(id) ? { ...item, read: true } : item));
    writeAll(next);
}

export function formatNotificationTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
