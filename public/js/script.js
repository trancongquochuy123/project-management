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


