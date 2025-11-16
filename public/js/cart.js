import { getLocal, setLocal, showToast } from "./utils.js";

export function initCartPage() {
    if (!document.querySelector(".cart-page")) return;
    renderCart();
    cartEvents();
}

function renderCart() {
    const cart = getLocal("cart");
    const container = document.querySelector(".cart-list");
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <input type="number" class="qty" data-id="${item.id}" value="${item.qty}">
            <button class="delete" data-id="${item.id}">🗑</button>
        </div>
    `).join("");
}

function cartEvents() {
    document.addEventListener("change", e => {
        if (e.target.classList.contains("qty")) updateQty(e);
    });

    document.addEventListener("click", e => {
        if (e.target.classList.contains("delete")) removeItem(e);
    });
}

function updateQty(e) {
    const id = e.target.dataset.id;
    const qty = parseInt(e.target.value);
    const cart = getLocal("cart");

    const item = cart.find(p => p.id === id);
    if (item) item.qty = qty > 0 ? qty : 1;

    setLocal("cart", cart);
    showToast("🔄 Cập nhật số lượng");
}

function removeItem(e) {
    const id = e.target.dataset.id;
    let cart = getLocal("cart").filter(item => item.id !== id);
    setLocal("cart", cart);
    renderCart();
    showToast("🗑 Đã xóa khỏi giỏ");
}
