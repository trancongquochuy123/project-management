import { initProductPage } from "./product.js";
import { initCartPage } from "./cart.js";

// Auto detect page
document.addEventListener("DOMContentLoaded", () => {
    initProductPage();
    initCartPage();
});
