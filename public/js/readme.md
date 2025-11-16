✅ **Các tính năng hiện có (Feature list) -- để bạn test**
--------------------------------------------------------

### **1\. Menu & UI Interaction**

| Tính năng | Mô tả |
| --- | --- |
| Detect submenu | Tự động thêm class `has-submenu` cho li có ul |
| Hover show/hide submenu | Hiển thị submenu và delay khi tắt (`HIDE_DELAY`) |

* * * * *

### **2\. Product Detail Page**

| Nhóm | Tính năng | Mô tả |
| --- | --- | --- |
| Buy | `buyNow()` | Thêm hàng → chuyển checkout |
| Cart | `addToCart()` | API add to cart & animation |
| Quantity | `initQuantityControls()` | Tăng/giảm input, validate min/max |
| Variant | `initVariantSelection()` | Chọn màu & chọn bộ nhớ |
| Rating | `initRatingInput()` + star hover | Highlight, select, save vào input |
| Gallery | `initImageGallery()` + `changeMainImage()` | Đổi ảnh chính khi click thumbnail |
| Lazy load | `initLazyLoading()` | IntersectObserver load ảnh |

* * * * *

### **3\. Review**

| Tính năng | Mô tả |
| --- | --- |
| `initReviewForm()` | Lắng nghe submit |
| `submitReview()` | Gửi review và reset |
| `resetRatingStars()` | Clear UI rating |

* * * * *

### **4\. Wishlist**

| Tính năng | Mô tả |
| --- | --- |
| `initWishlist()` | Toggle wishlist icon + gọi API |

* * * * *

### **5\. Compare Product**

| Tính năng | Mô tả |
| --- | --- |
| `initProductComparison()` | Gán event checkbox |
| `addToComparison()` | Lưu vào localStorage |
| `removeFromComparison()` | Remove item |
| `updateComparisonCount()` | Update UI badge |

* * * * *

### **6\. Shipping method**

| Tính năng | Mô tả |
| --- | --- |
| `initShippingMethods()` | Chọn phương thức giao hàng |
| `updateShippingCost()` | Update UI giá |

* * * * *

### **7\. Search Validation**

| Tính năng | Mô tả |
| --- | --- |
| `initSearchBar()` | Không cho submit nếu input rỗng |

* * * * *

### **8\. Notification System**

| Tính năng | Mô tả |
| --- | --- |
| `showNotification()` | Custom alert UI, auto hide |
| `getNotificationIcon()` | Mapping icon theo trạng thái |

* * * * *

⚠️ **Các phần code bị trùng & cần refactor**
--------------------------------------------

| Vị trí | Mô tả trùng | Gợi ý |
| --- | --- | --- |
| `document.addEventListener('DOMContentLoaded'...)` xuất hiện **2 lần** | Initialization gọi nhiều lần gây dư thừa | Hợp nhất thành 1 |
| `initializeProductDetail()` được gọi **2 lần** | Lặp không cần thiết | Gọi đúng 1 lần, tách theo page detection |
| Logic **event add remove active class** lặp giữa color, storage, thumbnails | Code pattern giống nhau | Tạo helper `toggleActive(items, target)` |
| Enable / disable button loading logic between **addToCart** & **buyNow** | Same logic | Tạo util `setButtonLoading(button, isLoading, text)` |
| `fetch` API calls lặp cấu trúc | Same header + error | Viết `apiRequest(url, method, data)` |
| Notification mapping icon + class có thể gộp chung | Có hàm riêng rồi nhưng style inline | Tách CSS riêng |

* * * * *

🚀 Đề xuất tách file khi refactor
---------------------------------

| File | Chứa |
| --- | --- |
| **utils.js** | showNotification, getNotificationIcon, apiRequest, setButtonLoading, toggleActive |
| **cart.js** | addToCart, buyNow, updateCartCount |
| **product.js** | variants, rating, gallery, quantity, lazy load, comparison init |
| **main.js** | DOMContentLoaded, menu hover, global init |

* * * * *