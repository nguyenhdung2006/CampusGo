const serviceMeta = {
    food: {
        title: "Giao đồ ăn",
        description: "Bước tiếp theo sẽ là màn loại món, nhà hàng, danh sách món và giỏ hàng cho sinh viên đặt nhanh trong campus.",
        tags: ["Cơm", "Mỳ", "Pizza", "Giỏ hàng"],
    },
    delivery: {
        title: "Giao hộ nội bộ",
        description: "Dịch vụ gửi đồ từ người A sang người B với form người gửi, người nhận, địa chỉ và kích thước hàng hóa.",
        tags: ["Người gửi", "Người nhận", "0-5kg", "5-20kg", "20-50kg"],
    },
    marketplace: {
        title: "Mua bán đồ cũ",
        description: "Sẽ có trang đăng sản phẩm, nút dấu cộng, thông tin sản phẩm và thao tác mua nhanh để demo.",
        tags: ["Đăng bài", "Mô tả", "Giá bán", "Mua ngay"],
    },
};

export function setupHome(user) {
    const heroUserName = document.getElementById("hero-user-name");
    const cards = document.querySelectorAll(".service-card");
    const title = document.getElementById("preview-title");
    const description = document.getElementById("preview-description");
    const tags = document.getElementById("preview-tags");

    heroUserName.textContent = user?.displayName || "Bạn";

    function renderPreview(serviceKey) {
        const meta = serviceMeta[serviceKey];
        title.textContent = meta.title;
        description.textContent = meta.description;
        tags.innerHTML = meta.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

        cards.forEach((card) => {
            card.classList.toggle("is-active", card.dataset.service === serviceKey);
        });
    }

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            renderPreview(card.dataset.service);
        });
    });

    renderPreview("food");
}
