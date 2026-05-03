import { apiDelete, apiGet, apiPost, apiPut } from "../config/api.js";
import { getCurrentUser } from "./userService.js";

const API_BASE = "/api/marketplace";
const LOCAL_ITEMS_KEY = "campusgo_marketplace_items";

function isNetworkError(error) {
    return !error?.status;
}

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
        category: "OTHER",
        conditionLabel: "USED",
        pickupLocation: "Campus",
        tradeMethod: "MEETUP",
        negotiable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...item,
        id: item.id || `LOCAL-${Date.now()}`,
    };
}

async function requireActiveSession() {
    const user = await getCurrentUser();
    if (!user) {
        const error = new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để quản lý bài đăng.");
        error.status = 401;
        throw error;
    }
    return user;
}

function toRemotePayload(item) {
    const {
        id,
        isLocal,
        syncStatus,
        syncError,
        ...payload
    } = item;

    return payload;
}

async function syncLocalItems(remoteItems = []) {
    const localItems = readLocalItems();
    if (!localItems.length) return remoteItems;

    const remoteItemsById = new Map(remoteItems.map((item) => [String(item.id), item]));
    const nextLocalItems = [];
    const syncedItems = [];

    for (let index = 0; index < localItems.length; index += 1) {
        const item = localItems[index];
        if (!item.isLocal) {
            if (!remoteItemsById.has(String(item.id))) nextLocalItems.push(item);
            continue;
        }

        try {
            const synced = await apiPost(API_BASE, toRemotePayload(item));
            syncedItems.push(synced);
        } catch (error) {
            nextLocalItems.push({
                ...item,
                syncStatus: "PENDING",
                syncError: error?.message || "Sync failed",
            });

            if (isNetworkError(error)) {
                nextLocalItems.push(...localItems.slice(index + 1));
                break;
            }
        }
    }

    writeLocalItems(nextLocalItems);
    return mergeItems([...syncedItems, ...remoteItems], nextLocalItems);
}

function mergeItems(remoteItems = [], localItems = readLocalItems()) {
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
        syncStatus: "PENDING",
    });

    items.unshift(item);
    writeLocalItems(items);
    return item;
}

export async function getAllItems() {
    try {
        const remoteItems = await apiGet(API_BASE);
        return syncLocalItems(Array.isArray(remoteItems) ? remoteItems : []);
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
        await requireActiveSession();
        const remoteItems = await apiGet(`${API_BASE}/mine`);
        const mergedItems = await syncLocalItems(Array.isArray(remoteItems) ? remoteItems : []);
        return mergedItems.filter((item) => {
            return !userId || Number(item.seller?.id) === Number(userId);
        });
    } catch {
        return localMine;
    }
}

export async function createItem(data) {
    try {
        await requireActiveSession();
        return await apiPost(API_BASE, data);
    } catch (error) {
        if (!isNetworkError(error)) throw error;

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

    await requireActiveSession();
    return apiPut(`${API_BASE}/${id}`, data);
}

export async function deleteItem(id) {
    const localItems = readLocalItems();
    const nextItems = localItems.filter((item) => String(item.id) !== String(id));

    if (nextItems.length !== localItems.length) {
        writeLocalItems(nextItems);
        return true;
    }

    await requireActiveSession();
    await apiDelete(`${API_BASE}/${id}`);
    return true;
}
