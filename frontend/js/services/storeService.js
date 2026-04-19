import { apiGet, apiPost } from "../config/api.js";

export function getStores(categoryId) {
    return apiGet(`/stores${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""}`);
}

export function submitRating(storeId, stars) {
    return apiPost(`/stores/${storeId}/rating?stars=${stars}`);
}