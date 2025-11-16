import { getLocal, setLocal, showToast, fetchAPI } from "./utils.js";

// Avoid Double Click
let isAddingToCart = false;

export function initProductPage() {
    if (!document.querySelector(".product-detail")) return;

    document.querySelector("#addToCartBtn")?.addEventListener("click", handleAddToCart);
    document.querySelector("#buyNowBtn")?.addEventListener("click", handleBuyNow);
    initReviewSection();
    initWishlistFeature();
    initCompareFeature();
}

async function handleAddToCart() {
    if (isAddingToCart) return;
    isAddingToCart = true;

    const product = getProductInfo();
    const cart = getLocal("cart");

    const existing = cart.find(item => item.id === product.id);
    existing ? existing.qty++ : cart.push(product);

    setLocal("cart", cart);
    showToast("✔ Thêm vào giỏ hàng thành công!");
    isAddingToCart = false;
}

function handleBuyNow() {
    handleAddToCart();
    window.location.href = "/cart.html";
}

// Get Product Detail from DOM
function getProductInfo() {
    return {
        id: document.getElementById("productId").value,
        name: document.getElementById("productName").textContent,
        price: parseFloat(document.getElementById("productPrice").textContent),
        qty: 1
    };
}

// ---------- Review ----------
function initReviewSection() {
    const btn = document.querySelector("#reviewBtn");
    btn && btn.addEventListener("click", () => showToast("📌 Chức năng đánh giá đang cập nhật"));
}

// ---------- Wishlist ----------
function initWishlistFeature() {
    const btn = document.querySelector("#wishlistBtn");
    btn && btn.addEventListener("click", () => showToast("❤️ Đã thêm vào yêu thích"));
}

// ---------- Compare ----------
function initCompareFeature() {
    const btn = document.querySelector("#compareBtn");
    btn && btn.addEventListener("click", () => showToast("🔍 Đã thêm vào so sánh"));
}
