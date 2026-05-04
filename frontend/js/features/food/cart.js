import { renderCartItem } from "../../components/cartItem.js";

export const FREE_DELIVERY_THRESHOLD = 100000;
export const BASE_DELIVERY_FEE = 5000;

export const CART_VOUCHERS = [
    {
        code: "NEWBIE20",
        title: "Người mới CampusGo",
        description: "Giảm 20.000đ cho đơn đầu tiên từ 50.000đ.",
        minOrder: 50000,
        type: "single",
        discountType: "FIXED",
        amount: 20000,
        isUsed: false,
        usageLimit: 1,
    },
    {
        code: "TETSV15",
        title: "Tết sinh viên",
        description: "Giảm 15% tối đa 25.000đ cho dịp Tết Việt Nam.",
        minOrder: 80000,
        type: "multi",
        discountType: "PERCENT",
        percent: 15,
        maxDiscount: 25000,
        isUsed: false,
    },
    {
        code: "LE304",
        title: "30/4 - 1/5",
        description: "Giảm 12.000đ cho các ngày lễ lớn trong campus.",
        minOrder: 70000,
        type: "multi",
        discountType: "FIXED",
        amount: 12000,
        isUsed: false,
    },
    {
        code: "SV2011",
        title: "20/11 tri ân",
        description: "Giảm 10% tối đa 18.000đ cho mùa tri ân thầy cô.",
        minOrder: 60000,
        type: "multi",
        discountType: "PERCENT",
        percent: 10,
        maxDiscount: 18000,
        isUsed: false,
    },
];

const USED_SINGLE_VOUCHERS_KEY = "campusgo.usedSingleVouchers";

function readUsedSingleVoucherCodes() {
    try {
        const parsed = JSON.parse(localStorage.getItem(USED_SINGLE_VOUCHERS_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("[voucher] Cannot read used voucher list", error);
        return [];
    }
}

function saveUsedSingleVoucherCodes(codes) {
    try {
        localStorage.setItem(USED_SINGLE_VOUCHERS_KEY, JSON.stringify([...new Set(codes)]));
    } catch (error) {
        console.warn("[voucher] Cannot save used voucher list", error);
    }
}

function getVoucherUsageType(voucher) {
    return String(voucher?.type || voucher?.usageType || "multi").toLowerCase();
}

function getVoucherDiscountType(voucher) {
    return String(voucher?.discountType || voucher?.discountKind || voucher?.type || "FIXED").toUpperCase();
}

export function isSingleUseVoucher(voucher) {
    return getVoucherUsageType(voucher) === "single" || Number(voucher?.usageLimit || 0) === 1;
}

export function isVoucherUsed(voucher) {
    if (!voucher || !isSingleUseVoucher(voucher)) return false;
    const usedCodes = readUsedSingleVoucherCodes();
    return Boolean(voucher.isUsed) || usedCodes.includes(voucher.code);
}

export function getVisibleVouchers() {
    return CART_VOUCHERS.filter((voucher) => !isVoucherUsed(voucher));
}

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
    const normalizedCode = String(code).trim().toUpperCase();
    return getVisibleVouchers().find((voucher) => voucher.code === normalizedCode) || null;
}

export function getVoucherSavingsForTotal(voucher, total) {
    if (!voucher || !total || total < Number(voucher.minOrder || 0)) return 0;

    if (getVoucherDiscountType(voucher) === "PERCENT") {
        const percentDiscount = Math.floor(total * Number(voucher.percent || 0) / 100);
        return Math.min(percentDiscount, Number(voucher.maxDiscount || percentDiscount));
    }

    return Math.min(Number(voucher.amount || 0), total);
}

export function getVoucherDiscount(cartState) {
    const voucher = getVoucherByCode(cartState.voucherCode);
    const total = getCartTotal(cartState);

    if (!voucher || !cartState.items.length) return 0;
    return getVoucherSavingsForTotal(voucher, total);
}

export function getBestVoucher(cartState) {
    const total = getCartTotal(cartState);
    if (!cartState.items.length) return null;

    return getVisibleVouchers()
        .map((voucher) => ({
            voucher,
            savings: getVoucherSavingsForTotal(voucher, total),
        }))
        .filter((item) => item.savings > 0)
        .sort((a, b) => b.savings - a.savings || Number(a.voucher.minOrder || 0) - Number(b.voucher.minOrder || 0))[0]?.voucher || null;
}

export function autoApplyBestVoucher(cartState) {
    if (!cartState.items.length) {
        cartState.voucherCode = "";
        return null;
    }

    const currentVoucher = getVoucherByCode(cartState.voucherCode);
    const currentDiscount = getVoucherDiscount(cartState);
    if (currentVoucher && currentDiscount > 0) return currentVoucher;

    const bestVoucher = getBestVoucher(cartState);
    cartState.voucherCode = bestVoucher?.code || "";
    return bestVoucher;
}

export function markVoucherAsUsed(code = "") {
    const voucher = CART_VOUCHERS.find((item) => item.code === String(code).trim().toUpperCase());
    if (!voucher || !isSingleUseVoucher(voucher)) return;

    voucher.isUsed = true;
    saveUsedSingleVoucherCodes([...readUsedSingleVoucherCodes(), voucher.code]);
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
        cartItemsEl.innerHTML = `
            <div class="cart-empty-state">
                <strong>Giỏ hàng đang trống 🛒</strong>
                <p>Thêm món để bắt đầu đơn hàng của bạn!</p>
                <button class="btn btn--secondary js-explore-food" type="button">Khám phá món</button>
            </div>
        `;
        return;
    }

    cartItemsEl.innerHTML = cartState.items.map(renderCartItem).join("");
}
