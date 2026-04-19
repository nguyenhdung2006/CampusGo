export async function createFoodOrder(payload) {
    console.log("Mock createFoodOrder payload:", payload);
    return Promise.resolve({
        success: true,
        orderId: `OD${Date.now()}`,
        message: "Đặt hàng thành công",
    });
}