import { apiGet, apiPost } from "../config/api.js";
import { getRestaurantsByCategory } from "./productService.js";

export async function getStores(categoryId) {
    try {
        const stores = await apiGet(`/stores${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""}`);
        if (Array.isArray(stores) && stores.length > 0) {
            return stores;
        }
    } catch (error) {
        console.warn("Fallback to local restaurants", error);
    }

    if (!categoryId) return [];
    return getRestaurantsByCategory(categoryId);
}

export function submitRating(storeId, stars) {
    return apiPost(`/stores/${storeId}/rating?stars=${stars}`);
}
