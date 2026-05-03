import { apiGet, apiPost } from "../config/api.js";
import { getRestaurantsByCategory } from "./productService.js";

const STORE_SHIFT_PROFILES = {
    rice: [
        [
            { label: "Sáng", open: "06:30", close: "09:30" },
            { label: "Trưa", open: "10:30", close: "13:30" },
            { label: "Tối", open: "17:00", close: "20:30" },
        ],
        [
            { label: "Trưa", open: "10:00", close: "13:45" },
            { label: "Tối", open: "16:45", close: "20:00" },
        ],
        [
            { label: "Sáng", open: "06:00", close: "09:00" },
            { label: "Trưa", open: "10:45", close: "14:00" },
            { label: "Tối", open: "17:30", close: "21:00" },
        ],
    ],
    noodle: [
        [
            { label: "Sáng", open: "06:30", close: "09:30" },
            { label: "Trưa", open: "10:30", close: "13:30" },
            { label: "Tối", open: "17:00", close: "22:30" },
        ],
        [
            { label: "Trưa", open: "10:30", close: "14:00" },
            { label: "Tối muộn", open: "17:30", close: "23:30" },
        ],
        [
            { label: "Tối", open: "16:30", close: "22:00" },
            { label: "Đêm", open: "22:00", close: "00:30" },
        ],
    ],
    pizza: [
        [
            { label: "Trưa", open: "10:30", close: "14:00" },
            { label: "Tối", open: "16:30", close: "23:00" },
        ],
        [
            { label: "Tối", open: "17:00", close: "23:30" },
            { label: "Đêm", open: "23:30", close: "01:00" },
        ],
        [
            { label: "Chiều tối", open: "15:30", close: "22:30" },
        ],
    ],
    "banh-mi": [
        [
            { label: "Sáng", open: "06:00", close: "10:00" },
            { label: "Xế", open: "15:30", close: "18:30" },
        ],
        [
            { label: "Sáng", open: "06:30", close: "09:30" },
            { label: "Trưa", open: "10:30", close: "13:00" },
            { label: "Tối", open: "16:30", close: "21:00" },
        ],
        [
            { label: "Sáng sớm", open: "05:45", close: "09:30" },
            { label: "Tối muộn", open: "18:00", close: "23:00" },
        ],
    ],
    "ga-ran": [
        [
            { label: "Trưa", open: "10:30", close: "14:00" },
            { label: "Tối", open: "16:00", close: "23:00" },
        ],
        [
            { label: "Chiều tối", open: "15:00", close: "22:30" },
        ],
        [
            { label: "Tối", open: "17:00", close: "23:30" },
            { label: "Đêm", open: "23:30", close: "01:30" },
        ],
    ],
    "bun-pho-mien": [
        [
            { label: "Sáng", open: "06:00", close: "09:30" },
            { label: "Trưa", open: "10:30", close: "13:30" },
            { label: "Tối", open: "17:00", close: "21:00" },
        ],
        [
            { label: "Sáng", open: "05:45", close: "10:00" },
            { label: "Tối", open: "16:30", close: "22:00" },
        ],
        [
            { label: "Trưa", open: "10:00", close: "13:30" },
            { label: "Tối muộn", open: "17:00", close: "23:30" },
        ],
    ],
    "com-xoi": [
        [
            { label: "Sáng", open: "06:00", close: "09:30" },
            { label: "Trưa", open: "10:30", close: "13:00" },
            { label: "Tối", open: "17:00", close: "20:30" },
        ],
        [
            { label: "Sáng sớm", open: "05:45", close: "09:00" },
            { label: "Xế tối", open: "16:00", close: "21:00" },
        ],
        [
            { label: "Trưa", open: "10:00", close: "13:30" },
            { label: "Tối", open: "17:30", close: "22:00" },
        ],
    ],
    default: [
        [
            { label: "Sáng", open: "07:00", close: "10:00" },
            { label: "Trưa", open: "10:30", close: "13:30" },
            { label: "Tối", open: "17:00", close: "21:00" },
        ],
        [
            { label: "Trưa", open: "10:00", close: "14:00" },
            { label: "Tối", open: "16:30", close: "22:00" },
        ],
    ],
};

function hashValue(value = "") {
    return String(value).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function timeToMinutes(value = "00:00") {
    const [hours, minutes] = String(value).split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

function isInsideShift(current, shift) {
    const open = timeToMinutes(shift.open);
    const close = timeToMinutes(shift.close);
    if (open === close) return true;
    if (close < open) return current >= open || current <= close;
    return current >= open && current <= close;
}

function normalizeShift(shift, index = 0) {
    if (Array.isArray(shift)) {
        return {
            label: shift[2] || `Ca ${index + 1}`,
            open: shift[0],
            close: shift[1],
        };
    }

    return {
        label: shift.label || `Ca ${index + 1}`,
        open: shift.open || shift.openTime,
        close: shift.close || shift.closeTime,
    };
}

function getShiftProfile(store) {
    if (Array.isArray(store.todayShifts) && store.todayShifts.length) {
        return store.todayShifts.map(normalizeShift).filter((shift) => shift.open && shift.close);
    }

    if (Array.isArray(store.shifts) && store.shifts.length) {
        return store.shifts.map(normalizeShift).filter((shift) => shift.open && shift.close);
    }

    if (store.openTime && store.closeTime) {
        return [{ label: "Hôm nay", open: store.openTime, close: store.closeTime }];
    }

    const name = String(store.name || "").toLowerCase();
    if (name.includes("24/7") || name.includes("24h")) {
        return [{ label: "Cả ngày", open: "00:00", close: "23:59" }];
    }

    const profiles = STORE_SHIFT_PROFILES[store.categoryId] || STORE_SHIFT_PROFILES.default;
    return profiles[hashValue(`${store.id}-${store.name}`) % profiles.length];
}

function minutesUntilShift(current, shift) {
    const open = timeToMinutes(shift.open);
    const diff = open - current;
    return diff >= 0 ? diff : diff + 24 * 60;
}

function getNextShift(shifts, current) {
    return [...shifts].sort((a, b) => minutesUntilShift(current, a) - minutesUntilShift(current, b))[0];
}

function formatShift(shift) {
    return `${shift.label} ${shift.open}-${shift.close}`;
}

function withStoreHours(store) {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const todayShifts = getShiftProfile(store);
    const currentShift = todayShifts.find((shift) => isInsideShift(current, shift)) || null;
    const nextShift = currentShift || getNextShift(todayShifts, current);
    const isOpen = Boolean(currentShift);
    const hoursText = todayShifts.map(formatShift).join("; ");
    const activeHoursText = currentShift
        ? `${currentShift.label} đến ${currentShift.close}`
        : nextShift
            ? `Mở lại ${nextShift.open} (${nextShift.label})`
            : "Chưa có lịch hôm nay";
    const hasHoursInDescription = String(store.description || "").includes("Giờ mở cửa hôm nay");
    const description = hasHoursInDescription
        ? store.description
        : `${store.description || "Quán ăn nội bộ campus."} Giờ mở cửa hôm nay: ${hoursText}.`;

    return {
        ...store,
        openTime: nextShift?.open,
        closeTime: currentShift?.close || nextShift?.close,
        todayShifts,
        currentShift,
        nextShift,
        hoursText,
        activeHoursText,
        isOpen,
        statusText: isOpen ? `Đang mở (${currentShift.label})` : "Đang nghỉ",
        nextOpenText: isOpen ? `Đóng lúc ${currentShift.close}` : activeHoursText,
        description,
    };
}

export async function getStores(categoryId) {
    try {
        const stores = await apiGet(`/stores${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""}`);
        if (Array.isArray(stores) && stores.length > 0) {
            return stores.map(withStoreHours);
        }
    } catch (error) {
        console.warn("Fallback to local restaurants", error);
    }

    if (!categoryId) return [];
    const stores = await getRestaurantsByCategory(categoryId);
    return stores.map(withStoreHours);
}

export function submitRating(storeId, stars) {
    return apiPost(`/stores/${storeId}/rating?stars=${stars}`);
}
