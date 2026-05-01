import { createFoodOrder } from "../../services/orderService.js";
import { getAddressBook } from "../../utils/addressStorage.js";

export async function checkoutFood({ user, cartState, messageEl, onSuccess }) {
    if (!cartState.items.length) {
        messageEl.textContent = "Giỏ hàng đang trống, vui lòng chọn món.";
        return;
    }

    const addressBook = getAddressBook();
    const payload = {
        user: { id: Number(user?.id || 1) },
        deliveryAddress: (addressBook?.defaultAddress || "KTX A").trim(),
        items: cartState.items.map((item) => ({
            product: { id: Number(item.id) },
            quantity: Number(item.quantity || 1),
            price: Number(item.price),
        })),
        paymentMethod: "CASH",
        note: "",
    };

    console.log("[checkoutFood] payload", payload);
    const result = await createFoodOrder(payload);
    console.log("[checkoutFood] result", result);

    if (result?.success) {
        messageEl.textContent = result.message || "Đặt hàng thành công.";
        cartState.items = [];
        onSuccess?.();
    } else {
        messageEl.textContent = result?.message || "Đặt hàng thất bại, vui lòng thử lại.";
    }
}