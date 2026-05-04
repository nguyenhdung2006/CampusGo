import { renderCartItem } from "../../components/cartItem.js";

export const FREE_DELIVERY_THRESHOLD = 100000;
export const BASE_DELIVERY_FEE = 5000;

export const CART_VOUCHERS = [
    {
        code: "NEWBIE20",
        title: "Người mới CampusGo",
        description: "Giảm 20.000đ cho đơn đầu tiên từ 50.000đ.",
        minOrder: 50000,
        type: "FIXED",
        amount: 20000,
    },
    {
        code: "TETSV15",
        title: "Tết sinh viên",
        description: "Giảm 15% tối đa 25.000đ cho dịp Tết Việt Nam.",
        minOrder: 80000,
        type: "PERCENT",
        percent: 15,
        maxDiscount: 25000,
    },
    {
        code: "LE304",
        title: "30/4 - 1/5",
        description: "Giảm 12.000đ cho các ngày lễ lớn trong campus.",
        minOrder: 70000,
        type: "FIXED",
        amount: 12000,
    },
    {
        code: "SV2011",
        title: "20/11 tri ân",
        description: "Giảm 10% tối đa 18.000đ cho mùa tri ân thầy cô.",
        minOrder: 60000,
        type: "PERCENT",
        percent: 10,
        maxDiscount: 18000,
    },
];

export function createCartState() {
    return {
        items: [],
        restaurantId: null,
        restaurantName: "",
        restaurantIsOpen: true,
        restaurantStatusText: "",
        voucherCode: "",
    };
}

function resetCartRestaurant(cartState) {
    cartState.restaurantId = null;
    cartState.restaurantName = "";
    cartState.restaurantIsOpen = true;
    cartState.restaurantStatusText = "";
}

export function addToCart(cartState, product, restaurant = {}) {
    const productRestaurantId = product.restaurantId || restaurant.id;

    if (
        cartState.items.length
        && cartState.restaurantId
        && productRestaurantId
        && String(cartState.restaurantId) !== String(productRestaurantId)
    ) {
        return {
            success: false,
            message: `Giỏ đang có món của ${cartState.restaurantName || "quán khác"}. Vui lòng thanh toán hoặc bỏ món cũ trước khi đổi quán.`,
        };
    }

    if (!cartState.items.length) {
        cartState.restaurantId = productRestaurantId || null;
        cartState.restaurantName = restaurant.name || product.store?.name || "";
        cartState.restaurantIsOpen = restaurant.isOpen !== false;
        cartState.restaurantStatusText = restaurant.statusText || "";
    }

    const existed = cartState.items.find((item) => String(item.id) === String(product.id));
    if (existed) {
        existed.quantity += 1;
    } else {
        cartState.items.push({
            id: product.id,
            restaurantId: productRestaurantId || null,
            name: product.name,
            price: product.price,
            prepMinutes: product.prepMinutes,
            prepTimeText: product.prepTimeText,
            quantity: 1,
        });
    }

    return { success: true };
}

export function increaseItem(cartState, productId) {
    const item = cartState.items.find((x) => String(x.id) === String(productId));
    if (item) item.quantity += 1;
}

export function decreaseItem(cartState, productId) {
    const item = cartState.items.find((x) => String(x.id) === String(productId));
    if (!item) return;

    item.quantity -= 1;
    if (item.quantity <= 0) {
        cartState.items = cartState.items.filter((x) => String(x.id) !== String(productId));
    }

    if (!cartState.items.length) {
        resetCartRestaurant(cartState);
    }
}

export function getCartCount(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cartState) {
    return cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getDeliveryFee(cartState) {
    const total = getCartTotal(cartState);
    if (!cartState.items.length || total >= FREE_DELIVERY_THRESHOLD) return 0;
    return BASE_DELIVERY_FEE;
}

export function getVoucherByCode(code = "") {
    return CART_VOUCHERS.find((voucher) => voucher.code === String(code).trim().toUpperCase()) || null;
}

export function getVoucherDiscount(cartState) {
    const voucher = getVoucherByCode(cartState.voucherCode);
    const total = getCartTotal(cartState);

    if (!voucher || !cartState.items.length || total < voucher.minOrder) return 0;

    if (voucher.type === "PERCENT") {
        const percentDiscount = Math.floor(total * Number(voucher.percent || 0) / 100);
        return Math.min(percentDiscount, Number(voucher.maxDiscount || percentDiscount));
    }

    return Math.min(Number(voucher.amount || 0), total);
}

export function getGrandTotal(cartState) {
    return Math.max(0, getCartTotal(cartState) + getDeliveryFee(cartState) - getVoucherDiscount(cartState));
}

function formatVnd(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export function renderCart(cartState, elements) {
    const {
        cartItemsEl,
        cartCountEl,
        cartTotalEl,
        cartDeliveryFeeEl,
        cartGrandTotalEl,
        cartFreeShipHintEl,
        cartVoucherEl,
        cartVoucherDiscountEl,
    } = elements;
    const count = getCartCount(cartState);
    const total = getCartTotal(cartState);
    const deliveryFee = getDeliveryFee(cartState);
    const voucher = getVoucherByCode(cartState.voucherCode);
    const voucherDiscount = getVoucherDiscount(cartState);
    const grandTotal = getGrandTotal(cartState);

    cartCountEl.textContent = `${count} món`;
    cartTotalEl.textContent = formatVnd(total);
    if (cartDeliveryFeeEl) cartDeliveryFeeEl.textContent = deliveryFee ? formatVnd(deliveryFee) : "Miễn phí";
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatVnd(grandTotal);
    if (cartVoucherEl) cartVoucherEl.textContent = voucher ? voucher.code : "Chưa chọn";
    if (cartVoucherDiscountEl) cartVoucherDiscountEl.textContent = voucherDiscount ? `-${formatVnd(voucherDiscount)}` : "0đ";
    if (cartFreeShipHintEl) {
        const remain = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
        cartFreeShipHintEl.textContent = remain && cartState.items.length
            ? `Thêm ${formatVnd(remain)} để được miễn phí giao trong campus.`
            : cartState.items.length
                ? "Đơn này được miễn phí giao trong campus."
                : "Miễn phí giao cho đơn từ 100.000đ.";
    }

    if (!cartState.items.length) {
        cartItemsEl.innerHTML = `<p class="empty-text">Chưa có món nào trong giỏ.</p>`;
        return;
    }

    cartItemsEl.innerHTML = cartState.items.map(renderCartItem).join("");
}
