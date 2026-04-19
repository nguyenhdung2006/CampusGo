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
        deliveryAddress: addressBook?.defaultAddress || "KTX A",
        items: cartState.items.map((item) => ({
        product: { id: Number(String(item.id).replace(/\D/g, "")) },
        quantity: Number(item.quantity || 1),
        })),
    };

    const result = await createFoodOrder(payload);

    if (result?.success) {
        messageEl.textContent = "Đặt hàng thành công.";
        cartState.items = [];
        onSuccess?.();
    } else {
        messageEl.textContent = result?.message || "Đặt hàng thất bại, vui lòng thử lại.";
    }
}