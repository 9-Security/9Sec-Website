/**
 * General UI Controller (Theme, Navigation, Smooth Scroll, Notifications)
 */

export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('9sec_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeLabel(themeToggleBtn, savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('9sec_theme', newTheme);
            updateThemeLabel(themeToggleBtn, newTheme);
        });
    }
}

function updateThemeLabel(btn, theme) {
    if (btn) btn.textContent = theme.toUpperCase();
}

export function initMobileMenu() {
    const nav = document.querySelector('nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (!nav || !mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', (e) => {
        const isOpen = nav.classList.toggle('mobile-menu-open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars', 'fa-xmark');
            icon.classList.add(isOpen ? 'fa-xmark' : 'fa-bars');
        }
    });

    document.querySelectorAll('nav .nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('mobile-menu-open');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
}

export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                e.preventDefault();
                targetElem.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

export function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

export function showNotice(msg) {
    const notice = document.createElement('div');
    notice.className = 'api-notice';
    const content = document.createElement('div');
    content.className = 'api-notice-content';
    const header = document.createElement('div');
    header.className = 'api-notice-header';
    header.textContent = 'SYSTEM_NOTIFICATION';
    const body = document.createElement('div');
    body.className = 'api-notice-body';
    body.textContent = String(msg ?? '');
    const button = document.createElement('button');
    button.className = 'api-notice-close';
    button.textContent = '[ ACKNOWLEDGE ]';
    content.append(header, body, button);
    notice.appendChild(content);
    document.body.appendChild(notice);

    button.onclick = () => notice.remove();
    setTimeout(() => notice.remove(), 10000);
}

// Global listener for notices (called from other modules)
window.addEventListener('9sec:notice', (e) => showNotice(e.detail));
