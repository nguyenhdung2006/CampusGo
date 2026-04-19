import { apiPost } from "../config/api.js";

export function createOrder(payload) {
    return apiPost("/orders", payload);
}

// Giữ nguyên tên hàm cũ để không vỡ code cũ
export async function createFoodOrder(payload) {
    try {
        const data = await apiPost("/orders", payload);

        // Giữ format cũ để UI của bạn vẫn chạy như trước
        return {
        success: true,
        orderId: data?.id ?? `OD${Date.now()}`,
        message: "Đặt hàng thành công",
        data, // thêm data thật từ backend nếu cần dùng
        };
    } catch (error) {
        return {
        success: false,
        message: error?.message || "Đặt hàng thất bại",
        };
    }
}