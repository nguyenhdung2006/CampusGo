import { ensureRatingModal } from "../../components/modal.js";
import { submitRating } from "../../services/storeService.js"; // đổi từ productService -> storeService

export function openRatingModal({ restaurantId, onRated }) {
    const overlay = ensureRatingModal();
    const starsWrap = overlay.querySelector("#rating-stars");
    const closeBtn = overlay.querySelector("#rating-close-btn");
    const submitBtn = overlay.querySelector("#rating-submit-btn");
    const starButtons = overlay.querySelectorAll(".star-btn");

    let selectedStars = 0;

    function paintStars(value) {
        starButtons.forEach((btn) => {
            const star = Number(btn.dataset.star);
            btn.classList.toggle("is-active", star <= value);
        });
    }

    function closeModal() {
        overlay.style.display = "none";
    }

    starsWrap.onclick = (event) => {
        const btn = event.target.closest(".star-btn");
        if (!btn) return;

        selectedStars = Number(btn.dataset.star);
        paintStars(selectedStars);
        submitBtn.disabled = selectedStars < 1;
    };

    closeBtn.onclick = () => closeModal();

    overlay.onclick = (event) => {
        if (event.target === overlay) closeModal();
    };

    submitBtn.onclick = async () => {
        if (!selectedStars) return;

        const res = await submitRating(restaurantId, selectedStars); // đổi hàm gọi
        if (res) {
            onRated?.(res);
        }
        closeModal();
    };

    // reset trước khi mở
    selectedStars = 0;
    paintStars(0);
    submitBtn.disabled = true;
    overlay.style.display = "grid";
}