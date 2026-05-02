import { apiDelete, apiGet, apiPost, apiPut } from "../config/api.js";

const API_BASE = "/api/marketplace";
const LOCAL_ITEMS_KEY = "campusgo_marketplace_items";

function readLocalItems() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_ITEMS_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeLocalItems(items) {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items.slice(0, 100)));
}

function normalizeItem(item) {
    return {
        status: "AVAILABLE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...item,
        id: item.id || `LOCAL-${Date.now()}`,
    };
}

function mergeItems(remoteItems = []) {
    const localItems = readLocalItems();
    const remoteIds = new Set(remoteItems.map((item) => String(item.id)));
    return [
        ...localItems.filter((item) => !remoteIds.has(String(item.id))),
        ...remoteItems,
    ];
}

function findLocalItem(id) {
    return readLocalItems().find((item) => String(item.id) === String(id));
}

function saveLocalItem(data) {
    const items = readLocalItems();
    const item = normalizeItem({
        ...data,
        id: data.id || `LOCAL-${Date.now()}`,
        isLocal: true,
    });

    items.unshift(item);
    writeLocalItems(items);
    return item;
}

export async function getAllItems() {
    try {
        const remoteItems = await apiGet(API_BASE);
        return mergeItems(Array.isArray(remoteItems) ? remoteItems : []);
    } catch {
        return readLocalItems();
    }
}

export async function getItemDetail(id) {
    const localItem = findLocalItem(id);
    if (localItem) return localItem;

    try {
        return await apiGet(`${API_BASE}/${id}`);
    } catch {
        return localItem || null;
    }
}

export async function getMyItems(userId) {
    const localMine = readLocalItems().filter((item) => {
        return userId && Number(item.seller?.id) === Number(userId);
    });

    try {
        const remoteItems = await apiGet(`${API_BASE}/mine${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`);
        return mergeItems(Array.isArray(remoteItems) ? remoteItems : []).filter((item) => {
            return !userId || Number(item.seller?.id) === Number(userId);
        });
    } catch {
        return localMine;
    }
}

export async function createItem(data) {
    try {
        return await apiPost(API_BASE, data);
    } catch (error) {
        console.warn("Fallback to local marketplace item", error);
        return saveLocalItem(data);
    }
}

export async function updateItem(id, data) {
    const localItems = readLocalItems();
    const index = localItems.findIndex((item) => String(item.id) === String(id));

    if (index >= 0) {
        localItems[index] = normalizeItem({
            ...localItems[index],
            ...data,
            updatedAt: new Date().toISOString(),
        });
        writeLocalItems(localItems);
        return localItems[index];
    }

    return apiPut(`${API_BASE}/${id}`, data);
}

export async function deleteItem(id, userId) {
    const localItems = readLocalItems();
    const nextItems = localItems.filter((item) => String(item.id) !== String(id));

    if (nextItems.length !== localItems.length) {
        writeLocalItems(nextItems);
        return true;
    }

    await apiDelete(`${API_BASE}/${id}${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`);
    return true;
}
