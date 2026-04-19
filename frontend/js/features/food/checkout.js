import { createFoodOrder } from "../../services/orderService.js";

export async function checkoutFood({ user, cartState, messageEl, onSuccess }) {
    if (!cartState.items.length) {
        messageEl.textContent = "Giỏ hàng đang trống, vui lòng chọn món.";
        return;
    }

    const payload = {
        userEmail: user?.email || "",
        items: cartState.items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
        })),
    };

    const result = await createFoodOrder(payload);

    if (result?.success) {
        messageEl.textContent = "Đặt hàng thành công.";
        cartState.items = [];
        onSuccess?.();
    } else {
        messageEl.textContent = "Đặt hàng thất bại, vui lòng thử lại.";
    }
}