// =============================
//  GLOBAL UTILS FUNCTIONS
// =============================

// LocalStorage Helpers
export function getLocal(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

export function setLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Toast
export function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// API Fetch
export async function fetchAPI(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("API Error");
        return await res.json();
    } catch (err) {
        console.error("❌ Fetch failed:", err);
        return null;
    }
}
