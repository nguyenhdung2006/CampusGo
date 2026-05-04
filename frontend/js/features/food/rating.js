import { ensureRatingModal } from "../../components/modal.js";
import { submitRating } from "../../services/storeService.js";

const REVIEW_STORAGE_KEY = "campusgo_food_rating_comments";

function readReviews() {
    try {
        const raw = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || "{}");
        return Object.entries(raw).reduce((reviews, [restaurantId, value]) => {
            reviews[restaurantId] = Array.isArray(value) ? value : value ? [value] : [];
            return reviews;
        }, {});
    } catch (error) {
        console.warn("Cannot read rating comments", error);
        return {};
    }
}

function writeReviews(reviews) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

function normalizeItems(items = []) {
    return items
        .map((item) => ({
            id: item.id,
            name: String(item.name || "Món đã đặt").trim(),
            quantity: Number(item.quantity || 1),
        }))
        .filter((item) => item.name);
}

function saveFeaturedReview({
    restaurantId,
    orderId,
    stars,
    comment,
    items,
    reviewerName,
    reviewerKey,
}) {
    const key = String(restaurantId);
    const reviews = readReviews();
    const safeOrderId = String(orderId || `LOCAL-${Date.now()}`);
    const nextReview = {
        id: `review-${safeOrderId}`,
        orderId: safeOrderId,
        stars,
        comment,
        items: normalizeItems(items),
        reviewerName: reviewerName || "Khách CampusGo",
        reviewerKey: reviewerKey || "",
        createdAt: new Date().toISOString(),
    };

    const oldReviews = reviews[key] || [];
    reviews[key] = [
        nextReview,
        ...oldReviews.filter((review) => String(review.orderId || review.id) !== safeOrderId),
    ].slice(0, 80);

    writeReviews(reviews);
    return nextReview;
}

export function getFeaturedReviews(restaurantId) {
    return (readReviews()[String(restaurantId)] || [])
        .filter((review) => Number(review.stars) > 0)
        .map((review) => ({
            ...review,
            comment: String(review.comment || "").trim(),
            items: normalizeItems(review.items || []),
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getFeaturedReview(restaurantId) {
    return getFeaturedReviews(restaurantId)[0] || null;
}

export function openRatingModal({
    restaurantId,
    orderId,
    orderedItems = [],
    reviewerName = "Khách CampusGo",
    reviewerKey = "",
    restaurantName = "",
    onRated,
}) {
    const overlay = ensureRatingModal();
    const starsWrap = overlay.querySelector("#rating-stars");
    const closeBtn = overlay.querySelector("#rating-close-btn");
    const submitBtn = overlay.querySelector("#rating-submit-btn");
    const commentInput = overlay.querySelector("#rating-comment-input");
    const commentHint = overlay.querySelector("#rating-comment-hint");
    const suggestionList = overlay.querySelector("#rating-suggestion-list");
    const starButtons = overlay.querySelectorAll(".star-btn");
    const contextEl = overlay.querySelector("#rating-order-context");

    let selectedStars = 0;

    function getItemSummary() {
        const names = normalizeItems(orderedItems).map((item) => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`);
        return names.length ? names.join(", ") : "Món vừa đặt";
    }

    function paintStars(value) {
        starButtons.forEach((btn) => {
            const star = Number(btn.dataset.star);
            btn.classList.toggle("is-active", star <= value);
        });
    }

    function updateCommentHint() {
        if (!commentHint) return;
        commentHint.textContent = selectedStars >= 4
            ? "Nếu bạn viết nhận xét, dòng này sẽ hiện trong phần đánh giá theo đơn."
            : "Bạn vẫn có thể gửi sao; mỗi đơn hàng chỉ ghi nhận một đánh giá.";
        suggestionList?.classList.toggle("is-visible", selectedStars >= 4);
    }

    function appendSuggestion(text) {
        if (!commentInput || !text) return;

        const currentParts = commentInput.value
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        if (!currentParts.includes(text)) {
            currentParts.push(text);
        }

        commentInput.value = currentParts.join(", ");
        commentInput.focus();
    }

    function closeModal() {
        overlay.style.display = "none";
    }

    starsWrap.onclick = (event) => {
        const btn = event.target.closest(".star-btn");
        if (!btn) return;

        selectedStars = Number(btn.dataset.star);
        paintStars(selectedStars);
        updateCommentHint();
        submitBtn.disabled = selectedStars < 1;
    };

    closeBtn.onclick = () => closeModal();

    overlay.onclick = (event) => {
        if (event.target === overlay) closeModal();
    };

    if (suggestionList) {
        suggestionList.onclick = (event) => {
            const btn = event.target.closest("[data-suggestion]");
            if (!btn || selectedStars < 4) return;
            appendSuggestion(btn.dataset.suggestion);
            btn.classList.add("is-picked");
        };
    }

    submitBtn.onclick = async () => {
        if (!selectedStars) return;

        const comment = (commentInput?.value || "").trim();
        const featuredReview = saveFeaturedReview({
            restaurantId,
            orderId,
            stars: selectedStars,
            comment,
            items: orderedItems,
            reviewerName,
            reviewerKey,
        });
        let res = null;
        try {
            res = await submitRating(restaurantId, selectedStars);
        } catch (error) {
            console.warn("Cannot submit rating to backend, kept local review", error);
        }

        onRated?.({ ...(res || {}), featuredReview });
        closeModal();
    };

    selectedStars = 0;
    paintStars(0);
    if (commentInput) commentInput.value = "";
    if (contextEl) {
        contextEl.textContent = `${restaurantName || "Đơn hàng"} · ${getItemSummary()}`;
    }
    suggestionList?.querySelectorAll(".is-picked").forEach((btn) => btn.classList.remove("is-picked"));
    updateCommentHint();
    submitBtn.disabled = true;
    overlay.style.display = "grid";
}
