// ========== helper: add class has-submenu nếu li có ul ==========
document.querySelectorAll('ul.menu li').forEach(li => {
    if (li.querySelector('ul')) {
        li.classList.add('has-submenu');
    }
});

// ========== show/hide với delay ==========
// delay (ms) khi ẩn submenu — tăng nếu bạn muốn dễ bám hơn
const HIDE_DELAY = 200;

document.querySelectorAll('ul.menu li.has-submenu').forEach(li => {
    let hideTimer = null;
    const submenu = li.querySelector('ul');

    // helper show/hide
    function showSub() {
        // thêm class is-open trên li để style caret; thêm class open cho submenu (nếu cần)
        li.classList.add('is-open');
        if (submenu) submenu.classList.add('open');
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    }
    function hideSub() {
        li.classList.remove('is-open');
        if (submenu) submenu.classList.remove('open');
    }

    li.addEventListener('mouseenter', () => {
        // khi hover vào li, show ngay
        showSub();
    });

    li.addEventListener('mouseleave', () => {
        // bắt đầu timeout khi rời
        hideTimer = setTimeout(() => {
            hideSub();
            hideTimer = null;
        }, HIDE_DELAY);
    });

    // nếu user đi thẳng vào submenu, xóa timer (submenu nằm trong li, nên mouseenter sẽ gọi)
    if (submenu) {
        submenu.addEventListener('mouseenter', () => {
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            showSub();
        });
        submenu.addEventListener('mouseleave', () => {
            hideTimer = setTimeout(() => {
                hideSub();
                hideTimer = null;
            }, HIDE_DELAY);
        });
    }
});


// ========== Detail sản phẩm client ==========
// Buy Now functionality
async function buyNow(purchaseData) {
    try {
        // Show loading state
        const btn = document.querySelector('.buy-now');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        btn.disabled = true;
        
        // Add to cart first, then redirect to checkout
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Redirect to checkout
            window.location.href = '/checkout';
        } else {
            showNotification(result.message || 'Có lỗi xảy ra', 'error');
            // Restore button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error with buy now:', error);
        showNotification('Có lỗi xảy ra khi mua hàng', 'error');
        
        // Restore button
        const btn = document.querySelector('.buy-now');
        btn.innerHTML = '<i class="fas fa-bolt me-2"></i>Mua ngay';
        btn.disabled = false;
    }
}

// Review Form
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const ratingValue = document.getElementById('rating-value')?.value;
            
            if (!ratingValue || ratingValue === '0') {
                showNotification('Vui lòng chọn số sao đánh giá', 'warning');
                return;
            }
            
            const reviewData = {
                product_id: formData.get('product_id'),
                rating: parseInt(ratingValue),
                comment: formData.get('comment')
            };
            
            await submitReview(reviewData);
        });
    }
}

// Submit Review API call
async function submitReview(reviewData) {
    try {
        const submitBtn = document.querySelector('#reviewForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
        submitBtn.disabled = true;
        
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Đánh giá của bạn đã được gửi thành công!', 'success');
            
            // Reset form
            document.getElementById('reviewForm').reset();
            resetRatingStars();
            
            // Refresh reviews section (optional)
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            if (response.status === 401) {
                showNotification('Vui lòng đăng nhập để đánh giá sản phẩm', 'warning');
            } else {
                showNotification(result.message || 'Có lỗi xảy ra khi gửi đánh giá', 'error');
            }
        }
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Có lỗi xảy ra khi gửi đánh giá', 'error');
        
        const submitBtn = document.querySelector('#reviewForm button[type="submit"]');
        submitBtn.innerHTML = 'Gửi đánh giá';
        submitBtn.disabled = false;
    }
}

// Reset rating stars
function resetRatingStars() {
    const ratingStars = document.querySelectorAll('.rating-star');
    ratingStars.forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
    
    const ratingInput = document.getElementById('rating-value');
    if (ratingInput) {
        ratingInput.value = '0';
    }
}

// Image Gallery
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
        });
    });
}

// Change main product image
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        // Add fade effect
        mainImage.style.opacity = '0.5';
        
        setTimeout(() => {
            mainImage.src = imageSrc;
            mainImage.style.opacity = '1';
        }, 200);
    }
}

// Update cart count in header
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count');
        const result = await response.json();
        
        if (response.ok) {
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = result.count;
                
                // Add animation
                cartCountElement.classList.add('animate-bounce');
                setTimeout(() => {
                    cartCountElement.classList.remove('animate-bounce');
                }, 600);
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Shipping method selection
function initShippingMethods() {
    const shippingMethods = document.querySelectorAll('.shipping-method');
    
    shippingMethods.forEach(method => {
        method.addEventListener('click', function() {
            shippingMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            
            const shippingCost = this.getAttribute('data-cost') || '0';
            updateShippingCost(shippingCost);
        });
    });
}

// Update shipping cost
function updateShippingCost(cost) {
    const shippingCostElement = document.querySelector('.shipping-cost');
    if (shippingCostElement) {
        shippingCostElement.textContent = cost === '0' ? 'Miễn phí' : `${parseInt(cost).toLocaleString('vi-VN')}₫`;
    }
}

// Wishlist functionality
function initWishlist() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.getAttribute('data-product-id');
            const isInWishlist = this.classList.contains('active');
            
            try {
                const response = await fetch('/api/wishlist', {
                    method: isInWishlist ? 'DELETE' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    this.classList.toggle('active');
                    const icon = this.querySelector('i');
                    
                    if (isInWishlist) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        showNotification('Đã xóa khỏi danh sách yêu thích', 'info');
                    } else {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        showNotification('Đã thêm vào danh sách yêu thích', 'success');
                    }
                } else {
                    if (response.status === 401) {
                        showNotification('Vui lòng đăng nhập để sử dụng tính năng này', 'warning');
                    } else {
                        showNotification(result.message || 'Có lỗi xảy ra', 'error');
                    }
                }
                
            } catch (error) {
                console.error('Error with wishlist:', error);
                showNotification('Có lỗi xảy ra', 'error');
            }
        });
    });
}

// Product comparison
function initProductComparison() {
    const compareCheckboxes = document.querySelectorAll('.compare-checkbox');
    
    compareCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const productId = this.getAttribute('data-product-id');
            const isChecked = this.checked;
            
            if (isChecked) {
                addToComparison(productId);
            } else {
                removeFromComparison(productId);
            }
        });
    });
}

// Add to comparison
function addToComparison(productId) {
    let comparison = JSON.parse(localStorage.getItem('productComparison') || '[]');
    
    if (comparison.length >= 4) {
        showNotification('Chỉ có thể so sánh tối đa 4 sản phẩm', 'warning');
        return;
    }
    
    if (!comparison.includes(productId)) {
        comparison.push(productId);
        localStorage.setItem('productComparison', JSON.stringify(comparison));
        updateComparisonCount();
        showNotification('Đã thêm vào danh sách so sánh', 'success');
    }
}

// Remove from comparison
function removeFromComparison(productId) {
    let comparison = JSON.parse(localStorage.getItem('productComparison') || '[]');
    comparison = comparison.filter(id => id !== productId);
    localStorage.setItem('productComparison', JSON.stringify(comparison));
    updateComparisonCount();
    showNotification('Đã xóa khỏi danh sách so sánh', 'info');
}

// Update comparison count
function updateComparisonCount() {
    const comparison = JSON.parse(localStorage.getItem('productComparison') || '[]');
    const countElement = document.querySelector('.comparison-count');
    
    if (countElement) {
        countElement.textContent = comparison.length;
        countElement.style.display = comparison.length > 0 ? 'inline' : 'none';
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
    initShippingMethods();
    initWishlist();
    initProductComparison();
    updateComparisonCount();
});

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
} 

document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
});

function initializeProductDetail() {
    // Initialize quantity controls
    initQuantityControls();
    
    // Initialize variant selection
    initVariantSelection();
    
    // Initialize rating input
    initRatingInput();
    
    // Initialize add to cart functionality
    initAddToCart();
    
    // Initialize review form
    initReviewForm();
    
    // Initialize image gallery
    initImageGallery();
}

// Quantity Controls
function initQuantityControls() {
    const minusBtn = document.querySelector('.btn-minus');
    const plusBtn = document.querySelector('.btn-plus');
    const quantityInput = document.querySelector('.quantity-input input');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            let minValue = parseInt(quantityInput.getAttribute('min')) || 1;
            
            if (currentValue > minValue) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            let maxValue = parseInt(quantityInput.getAttribute('max')) || 999;
            
            if (currentValue < maxValue) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        // Validate input
        quantityInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            let minValue = parseInt(this.getAttribute('min')) || 1;
            let maxValue = parseInt(this.getAttribute('max')) || 999;
            
            if (isNaN(value) || value < minValue) {
                this.value = minValue;
            } else if (value > maxValue) {
                this.value = maxValue;
            }
        });
    }
}

// Variant Selection
function initVariantSelection() {
    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update selected color info (you can add more logic here)
            const selectedColor = this.getAttribute('data-color');
            console.log('Selected color:', selectedColor);
        });
    });
    
    // Storage selection
    const storageOptions = document.querySelectorAll('.storage-option');
    storageOptions.forEach(option => {
        option.addEventListener('click', function() {
            storageOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update selected storage info and potentially price
            const selectedStorage = this.getAttribute('data-storage');
            console.log('Selected storage:', selectedStorage);
            
            // You can update price based on storage here
            // updatePriceByStorage(selectedStorage);
        });
    });
}

// Rating Input
function initRatingInput() {
    const ratingStars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;
    
    ratingStars.forEach((star, index) => {
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });
        
        star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
        
        star.addEventListener('click', function() {
            selectedRating = index + 1;
            highlightStars(selectedRating);
            
            // Store rating value for form submission
            const ratingInput = document.getElementById('rating-value') || createHiddenInput('rating-value');
            ratingInput.value = selectedRating;
        });
    });
    
    function highlightStars(count) {
        ratingStars.forEach((star, index) => {
            if (index < count) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
    
    function createHiddenInput(name) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'rating';
        input.id = name;
        document.getElementById('reviewForm').appendChild(input);
        return input;
    }
}

// Add to Cart Functionality
function initAddToCart() {
    const addToCartBtn = document.querySelector('.add-to-cart');
    const buyNowBtn = document.querySelector('.buy-now');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = document.querySelector('.quantity-input input').value;
            
            // Get selected variants
            const selectedColor = document.querySelector('.color-option.active')?.getAttribute('data-color');
            const selectedStorage = document.querySelector('.storage-option.active')?.getAttribute('data-storage');
            
            const cartData = {
                productId: productId,
                quantity: parseInt(quantity),
                variants: {
                    color: selectedColor,
                    storage: selectedStorage
                }
            };
            
            addToCart(cartData);
        });
    }
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = document.querySelector('.quantity-input input').value;
            
            // Get selected variants
            const selectedColor = document.querySelector('.color-option.active')?.getAttribute('data-color');
            const selectedStorage = document.querySelector('.storage-option.active')?.getAttribute('data-storage');
            
            const purchaseData = {
                productId: productId,
                quantity: parseInt(quantity),
                variants: {
                    color: selectedColor,
                    storage: selectedStorage
                }
            };
            
            buyNow(purchaseData);
        });
    }
}

// Add to Cart API call
async function addToCart(cartData) {
    try {
        // Show loading state
        const btn = document.querySelector('.add-to-cart');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang thêm...';
        btn.disabled = true;
        
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Success
            showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
            updateCartCount();
        } else {
            // Error
            showNotification(result.message || 'Có lỗi xảy ra khi thêm sản phẩm', 'error');
        }
        
        // Restore button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Có lỗi xảy ra khi thêm sản phẩm', 'error');
        
        // Restore button
        const btn = document.querySelector('.add-to-cart');
        btn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Thêm vào giỏ hàng';
        btn.disabled = false;
    }
}

// Search bar
function initSearchBar() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const queryInput = this.querySelector('input[name="keyword"]');
            if (!queryInput.value.trim()) {
                e.preventDefault();
                showNotification('Vui lòng nhập từ khóa tìm kiếm', 'warning');
            }
        });
    }
}