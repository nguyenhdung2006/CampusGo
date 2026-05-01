import { apiPost } from "../config/api.js";

const LOCAL_ORDER_KEY = "campusgo_demo_orders";

export function createOrder(payload) {
    return apiPost("/orders", payload);
}

function isNetworkFailure(error) {
    return error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(error?.message || "");
}

function saveDemoOrder(payload) {
    const orders = JSON.parse(localStorage.getItem(LOCAL_ORDER_KEY) || "[]");
    const demoOrder = {
        id: `DEMO-${Date.now()}`,
        status: "PENDING",
        totalPrice: null,
        createdAt: new Date().toISOString(),
        ...payload,
    };

    orders.unshift(demoOrder);
    localStorage.setItem(LOCAL_ORDER_KEY, JSON.stringify(orders.slice(0, 20)));
    return demoOrder;
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
        if (isNetworkFailure(error)) {
            const data = saveDemoOrder(payload);
            return {
                success: true,
                isDemo: true,
                orderId: data.id,
                message: "Đặt hàng demo thành công. Backend chưa nhận đơn vì không kết nối được.",
                data,
            };
        }

        return {
        success: false,
        message: error?.message || "Đặt hàng thất bại",
        };
    }
}
