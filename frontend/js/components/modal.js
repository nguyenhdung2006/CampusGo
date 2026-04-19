export function ensureRatingModal() {
    let root = document.getElementById("rating-modal-root");
    if (root) return root;

    root = document.createElement("div");
    root.id = "rating-modal-root";
    root.className = "rating-modal-overlay";
    root.style.display = "none";

    root.innerHTML = `
        <div class="rating-modal">
            <button class="rating-close-btn" id="rating-close-btn" aria-label="Đóng">✕</button>
            <p class="eyebrow">Đánh giá đơn hàng</p>
            <h3>Bạn thấy nhà hàng này thế nào?</h3>
            <p class="rating-modal-sub">Chạm vào số sao để đánh giá từ 1 đến 5.</p>

            <div class="rating-stars" id="rating-stars">
                <button class="star-btn" data-star="1">★</button>
                <button class="star-btn" data-star="2">★</button>
                <button class="star-btn" data-star="3">★</button>
                <button class="star-btn" data-star="4">★</button>
                <button class="star-btn" data-star="5">★</button>
            </div>

            <button id="rating-submit-btn" class="btn btn--primary btn--full" disabled>Gửi đánh giá</button>
        </div>
    `;

    document.body.appendChild(root);
    return root;
}