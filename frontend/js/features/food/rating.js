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

function saveFeaturedReview(restaurantId, stars, comment) {
    const key = String(restaurantId);
    const reviews = readReviews();
    const nextReview = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        stars,
        comment,
        createdAt: new Date().toISOString(),
    };

    reviews[key] = [nextReview, ...(reviews[key] || [])].slice(0, 60);

    writeReviews(reviews);
    return nextReview;
}

export function getFeaturedReviews(restaurantId) {
    return (readReviews()[String(restaurantId)] || [])
        .filter((review) => Number(review.stars) >= 4 && String(review.comment || "").trim())
        .map((review) => ({
            ...review,
            comment: String(review.comment).trim(),
        }));
}

export function getFeaturedReview(restaurantId) {
    return getFeaturedReviews(restaurantId)[0] || null;
}

export function openRatingModal({ restaurantId, onRated }) {
    const overlay = ensureRatingModal();
    const starsWrap = overlay.querySelector("#rating-stars");
    const closeBtn = overlay.querySelector("#rating-close-btn");
    const submitBtn = overlay.querySelector("#rating-submit-btn");
    const commentInput = overlay.querySelector("#rating-comment-input");
    const commentHint = overlay.querySelector("#rating-comment-hint");
    const suggestionList = overlay.querySelector("#rating-suggestion-list");
    const starButtons = overlay.querySelectorAll(".star-btn");

    let selectedStars = 0;

    function paintStars(value) {
        starButtons.forEach((btn) => {
            const star = Number(btn.dataset.star);
            btn.classList.toggle("is-active", star <= value);
        });
    }

    function updateCommentHint() {
        if (!commentHint) return;
        commentHint.textContent = selectedStars >= 4
            ? "Nếu bạn viết nhận xét, dòng này sẽ hiện trong phần đánh giá nổi bật."
            : "Bạn vẫn có thể gửi sao; nhận xét chỉ hiển thị khi chấm 4 hoặc 5 sao.";
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
        const featuredReview = saveFeaturedReview(restaurantId, selectedStars, comment);
        const res = await submitRating(restaurantId, selectedStars);

        if (res) {
            onRated?.({ ...res, featuredReview });
        }
        closeModal();
    };

    selectedStars = 0;
    paintStars(0);
    if (commentInput) commentInput.value = "";
    suggestionList?.querySelectorAll(".is-picked").forEach((btn) => btn.classList.remove("is-picked"));
    updateCommentHint();
    submitBtn.disabled = true;
    overlay.style.display = "grid";
}
