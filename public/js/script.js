// =============================
//  CART PAGE FUNCTIONS
// =============================

// Kiểm tra xem đang ở trang nào
const isCartPage = window.location.pathname.includes('/cart');
const isProductDetailPage = document.querySelector('.product-detail') || document.querySelector('.add-to-cart');

// =============================
//  🛒 CART PAGE - CẬP NHẬT SỐ LƯỢNG
// =============================
function initCartPage() {
    console.log('🛒 Initializing Cart Page');

    // Nút tăng/giảm số lượng
    document.querySelectorAll('.btn-decrease, .btn-increase').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            const cartItem = this.closest('.cart-item');
            const input = cartItem.querySelector('.quantity-input');
            const currentQty = parseInt(input.value);
            const maxStock = parseInt(input.max);

            let newQty = currentQty;
            if (this.classList.contains('btn-decrease')) {
                newQty = Math.max(1, currentQty - 1);
            } else {
                newQty = Math.min(maxStock, currentQty + 1);
            }

            if (newQty !== currentQty) {
                input.value = newQty;
                await updateCartQuantity(productId, newQty);
            }
        });
    });

    // Input số lượng thay đổi trực tiếp
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', async function () {
            const productId = this.dataset.productId;
            const maxStock = parseInt(this.max);
            const minQty = 1;
            let newQty = parseInt(this.value) || 1;

            // Validate số lượng
            newQty = Math.max(minQty, Math.min(maxStock, newQty));
            this.value = newQty;

            await updateCartQuantity(productId, newQty);
        });

        // Ngăn nhập số âm hoặc số 0
        input.addEventListener('keypress', function (e) {
            if (e.key === '-' || e.key === '+' || e.key === 'e') {
                e.preventDefault();
            }
        });
    });

    // Nút xóa sản phẩm
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

            const productId = this.dataset.productId;
            await removeCartItem(productId);
        });
    });
}

// =============================
//  📝 CẬP NHẬT SỐ LƯỢNG SẢN PHẨM
// =============================
async function updateCartQuantity(productId, quantity) {
    try {
        showLoadingSpinner();
        
        const response = await fetch('/cart/update', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId,
                quantity
            })
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('✅ Đã cập nhật số lượng!', 'success');
            // Reload trang để cập nhật tổng tiền
            setTimeout(() => location.reload(), 500);
        } else {
            showNotification(result.message || '❌ Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// =============================
//  🗑️ XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// =============================
async function removeCartItem(productId) {
    try {
        showLoadingSpinner();
        
        const response = await fetch(`/cart/delete/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('✅ Đã xóa sản phẩm!', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showNotification('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showNotification('❌ Có lỗi xảy ra. Vui lòng thử lại!', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// =============================
//  PRODUCT DETAIL PAGE
// =============================
let isAddingToCart = false;

function initProductDetailPage() {
    console.log('📦 Initializing Product Detail Page');
    
    const btn = document.querySelector('.add-to-cart');
    if (!btn) return;

    const productId = btn.dataset.productId;
    if (!productId) {
        console.warn('⚠️ Thiếu productId trong data-product-id');
        return;
    }

    btn.addEventListener('click', async () => {
        const quantityInput = document.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput?.value) || 1;
        await addToCart({ productId, quantity });
    });

    // Nút tăng/giảm số lượng
    const btnMinus = document.querySelector('.btn-minus');
    const btnPlus = document.querySelector('.btn-plus');
    const quantityInput = document.querySelector('.quantity-input');

    if (btnMinus && btnPlus && quantityInput) {
        btnMinus.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            quantityInput.value = Math.max(1, current - 1);
        });

        btnPlus.addEventListener('click', () => {
            const current = parseInt(quantityInput.value);
            const max = parseInt(quantityInput.max);
            quantityInput.value = Math.min(max, current + 1);
        });
    }

    updateCartCount();
}

// =============================
//  🛒 THÊM VÀO GIỎ HÀNG
// =============================
async function addToCart(cartData) {
    if (isAddingToCart) return;
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
            showNotification(result.message || '❌ Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('❌ Có lỗi xảy ra khi thêm sản phẩm', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        isAddingToCart = false;
    }
}

// =============================
//  🔢 CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG (HEADER)
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
    // Xóa thông báo cũ nếu có
    const oldNotify = document.querySelector('.notification');
    if (oldNotify) oldNotify.remove();

    const notify = document.createElement('div');
    notify.className = `notification ${type}`;
    notify.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    notify.textContent = message;
    document.body.appendChild(notify);
    
    setTimeout(() => {
        notify.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notify.remove(), 300);
    }, 3000);
}

// =============================
//  ⏳ LOADING SPINNER
// =============================
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
    spinner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: white;
    `;
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
}

// =============================
//  🧠 KHỞI TẠO DỰA TRÊN TRANG
// =============================
document.addEventListener('DOMContentLoaded', () => {
    if (isCartPage) {
        initCartPage();
    } else if (isProductDetailPage) {
        initProductDetailPage();
    }
    
    // CSS cho animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});