// =============================
//  PRODUCT DETAIL PAGE SCRIPT
// =============================

// ⚙️ Trạng thái tránh double-click
let isAddingToCart = false;

// =============================
//  🛒 ADD TO CART
// =============================
async function addToCart(cartData) {
    if (isAddingToCart) return; // ⛔ Chặn gọi trùng
    isAddingToCart = true;

    const btn = document.querySelector('.add-to-cart');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang thêm...';
    btn.disabled = true;

    try {
        const response = await fetch(`/cart/add/${cartData.productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: cartData.quantity })
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('✅ Đã thêm sản phẩm vào giỏ hàng!', 'success');
            updateCartCount();
        } else {
            showNotification(result.message || '❌ Có lỗi xảy ra khi thêm sản phẩm', 'error');
        }
    } catch (error) {
        console.error('❌ Lỗi thêm sản phẩm:', error);
        showNotification('❌ Có lỗi xảy ra khi thêm sản phẩm', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        isAddingToCart = false;
    }
}

// =============================
//  🔢 CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG
// =============================
async function updateCartCount() {
    try {
        const response = await fetch('/cart/count');
        const result = await response.json();

        if (response.ok && typeof result.count === 'number') {
            const cartCountEl = document.querySelector('.cart-count');
            if (cartCountEl) cartCountEl.textContent = result.count;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// =============================
//  🔔 HIỂN THỊ THÔNG BÁO
// =============================
function showNotification(message, type = 'info') {
    const notify = document.createElement('div');
    notify.className = `notification ${type}`;
    notify.textContent = message;
    document.body.appendChild(notify);
    setTimeout(() => notify.remove(), 3000);
}

// =============================
//  📦 KHỞI TẠO NÚT ADD TO CART
// =============================
function initAddToCart() {
    const btn = document.querySelector('.add-to-cart');
    const quantityInput = document.querySelector('#quantity');

    if (!btn) return;

    const productId = btn.dataset.productId;
    if (!productId) {
        console.warn('⚠️ Thiếu productId trong data-product-id');
        return;
    }

    btn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput?.value) || 1;
        addToCart({ productId, quantity });
    });
}

// =============================
//  💖 WISHLIST
// =============================
function initWishlist() {
    const btn = document.querySelector('.wishlist-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            showNotification('💖 Đã cập nhật danh sách yêu thích!', 'success');
        });
    }
}

// =============================
//  ⚖️ PRODUCT COMPARISON
// =============================
function initProductComparison() {
    const btn = document.querySelector('.compare-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            showNotification('⚖️ Đã cập nhật danh sách so sánh!', 'success');
        });
    }
}

// =============================
//  🚚 SHIPPING METHODS
// =============================
function initShippingMethods() {
    console.log('🚚 Shipping methods initialized');
}

// =============================
//  🖼️ LAZY LOADING ẢNH
// =============================
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => observer.observe(img));
}

// =============================
//  🔧 HÀM KHỞI TẠO CHÍNH
// =============================
function initializeProductDetail() {
    initAddToCart();
    initWishlist();
    initProductComparison();
    initShippingMethods();
    initLazyLoading();
    updateCartCount();
}

// =============================
//  🧠 CHẠY KHI DOM SẴN SÀNG
// =============================
document.addEventListener('DOMContentLoaded', initializeProductDetail);


