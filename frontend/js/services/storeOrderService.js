import { apiGet, apiPut } from "../config/api.js";

export async function getStoreOrdersByStatus(status) {
    return apiGet(`/store/orders?status=${encodeURIComponent(status)}`);
}

export async function confirmOrder(orderId) {
    return apiPut(`/store/orders/${orderId}/confirm`);
}

export async function setProcessing(orderId) {
    return apiPut(`/store/orders/${orderId}/processing`);
}

export async function setPacked(orderId) {
    return apiPut(`/store/orders/${orderId}/packed`);
}