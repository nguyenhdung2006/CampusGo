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
            <p id="rating-order-context" class="rating-order-context"></p>

            <div class="rating-stars" id="rating-stars">
                <button class="star-btn" data-star="1">★</button>
                <button class="star-btn" data-star="2">★</button>
                <button class="star-btn" data-star="3">★</button>
                <button class="star-btn" data-star="4">★</button>
                <button class="star-btn" data-star="5">★</button>
            </div>

            <label class="rating-comment">
                <span>Viết vài dòng đánh giá</span>
                <textarea id="rating-comment-input" rows="3" maxlength="180" placeholder="Ví dụ: Pizza nóng, giao nhanh, nhân viên dễ thương..."></textarea>
            </label>
            <div id="rating-suggestion-list" class="rating-suggestion-list" aria-label="Gợi ý nhận xét">
                <button type="button" data-suggestion="Giao nhanh">Giao nhanh</button>
                <button type="button" data-suggestion="Món nóng">Món nóng</button>
                <button type="button" data-suggestion="Vừa miệng">Vừa miệng</button>
                <button type="button" data-suggestion="Đóng gói gọn">Đóng gói gọn</button>
                <button type="button" data-suggestion="Phần đầy đặn">Phần đầy đặn</button>
                <button type="button" data-suggestion="Sẽ đặt lại">Sẽ đặt lại</button>
            </div>
            <p id="rating-comment-hint" class="rating-comment-hint">Nhận xét sẽ được hiển thị khi bạn chấm 4 hoặc 5 sao.</p>

            <button id="rating-submit-btn" class="btn btn--primary btn--full" disabled>Gửi đánh giá</button>
        </div>
    `;

    document.body.appendChild(root);
    return root;
}
