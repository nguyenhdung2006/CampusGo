const USER_KEY = "campusgo-demo-user";

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
    localStorage.removeItem(USER_KEY);
}
