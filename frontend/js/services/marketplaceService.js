import { apiDelete, apiGet, apiPost, apiPut } from "../config/api.js";

const API_BASE = "/api/marketplace";

export function getAllItems() {
    return apiGet(API_BASE);
}

export function getItemDetail(id) {
    return apiGet(`${API_BASE}/${id}`);
}

export function getMyItems(userId) {
    return apiGet(`${API_BASE}/mine${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`);
}

export function createItem(data) {
    return apiPost(API_BASE, data);
}

export function updateItem(id, data) {
    return apiPut(`${API_BASE}/${id}`, data);
}

export async function deleteItem(id, userId) {
    await apiDelete(`${API_BASE}/${id}${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`);
    return true;
}
