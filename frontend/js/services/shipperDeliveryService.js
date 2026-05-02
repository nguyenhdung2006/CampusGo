import { apiGet, apiPut } from "../config/api.js";

export function getAvailableDeliveries() {
    return apiGet("/deliveries/available");
}

export function getMyDeliveries() {
    return apiGet("/deliveries/mine");
}

export function claimDelivery(id) {
    return apiPut(`/deliveries/${id}/claim`);
}

export function pickedUpDelivery(id) {
    return apiPut(`/deliveries/${id}/picked-up`);
}

export function deliveredDelivery(id) {
    return apiPut(`/deliveries/${id}/delivered`);
}