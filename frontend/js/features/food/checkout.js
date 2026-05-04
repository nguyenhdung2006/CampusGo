import { createFoodOrder } from "../../services/orderService.js";
import { getAddressBook } from "../../utils/addressStorage.js";
import { getDeliveryFee, getGrandTotal, getVoucherDiscount } from "./cart.js";

export async function checkoutFood({
    user,
    cartState,
    messageEl,
    paymentMethod = "CASH",
    note = "",
    restaurant,
    onSuccess,
}) {
    if (!cartState.items.length) {
        messageEl.textContent = "Giỏ hàng đang trống, vui lòng chọn món.";
        return;
    }

    if (restaurant?.isOpen === false || cartState.restaurantIsOpen === false) {
        messageEl.textContent = `${restaurant?.name || cartState.restaurantName || "Quán"} đang ngoài ca bán. ${restaurant?.nextOpenText || "Vui lòng chọn quán đang mở."}`;
        return;
    }

    const addressBook = getAddressBook();
    const orderedItems = cartState.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        restaurantId: item.restaurantId || cartState.restaurantId || restaurant?.id || null,
    }));

    const payload = {
        user: { id: Number(user?.id || 1) },
        deliveryAddress: (addressBook?.defaultAddress || "KTX A").trim(),
        items: orderedItems.map((item) => ({
            product: { id: Number(item.id) },
            quantity: Number(item.quantity || 1),
            price: Number(item.price),
        })),
        paymentMethod,
        note: note.trim(),
        totalPrice: getGrandTotal(cartState),
        deliveryFee: getDeliveryFee(cartState),
        discountAmount: getVoucherDiscount(cartState),
        voucherCode: cartState.voucherCode || "",
        estimatedTotal: getGrandTotal(cartState),
    };

    console.log("[checkoutFood] payload", payload);
    const result = await createFoodOrder(payload);
    console.log("[checkoutFood] result", result);

    if (result?.success) {
        messageEl.textContent = result.message || "Đặt hàng thành công.";
        const successContext = {
            result,
            orderId: result.orderId,
            orderedItems,
            restaurantId: cartState.restaurantId || restaurant?.id || null,
            restaurantName: restaurant?.name || cartState.restaurantName || "",
        };

        cartState.items = [];
        cartState.restaurantId = null;
        cartState.restaurantName = "";
        cartState.restaurantIsOpen = true;
        cartState.restaurantStatusText = "";
        cartState.voucherCode = "";
        onSuccess?.(successContext);
    } else {
        messageEl.textContent = result?.message || "Đặt hàng thất bại, vui lòng thử lại.";
    }
}
