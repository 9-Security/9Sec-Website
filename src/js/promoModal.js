/**
 * SMTP Check promo modal (restored from legacy script.js for Vite bundle).
 * Once per browser session; hidden on smtp-check page.
 */

import { updateLanguage } from './i18n.js';

const SESSION_KEY = '9sec_promo_seen';

function shouldSkipPromo() {
    const path = window.location.pathname || '';
    if (path.includes('smtp-check.html')) return true;
    return Boolean(sessionStorage.getItem(SESSION_KEY));
}

function closePromoModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.remove();
    }, 300);
    sessionStorage.setItem(SESSION_KEY, 'true');
}

function injectPromoModal() {
    if (shouldSkipPromo()) return;
    if (document.getElementById('promo-modal')) return;

    const modalHtml = `
    <div id="promo-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="promo-modal-title">
        <div class="modal-content">
            <button type="button" class="modal-close-x" id="btn-promo-close" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            <i class="fa-solid fa-envelope-shield modal-icon" aria-hidden="true"></i>
            <h2 class="modal-title" id="promo-modal-title" data-i18n="promo_modal.title">FREE SECURITY ASSESSMENT</h2>
            <p class="modal-desc" data-i18n="promo_modal.desc">Check your Email Security (SMTP/MX) status for free.</p>
            <div class="modal-actions">
                <a href="smtp-check.html" class="btn primary-btn" id="btn-promo-accept">
                    <i class="fa-solid fa-radar" aria-hidden="true"></i> <span data-i18n="promo_modal.accept">Check Now</span>
                </a>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('promo-modal');
    const closeBtn = document.getElementById('btn-promo-close');
    const acceptBtn = document.getElementById('btn-promo-accept');

    const lang = localStorage.getItem('9sec_lang') || 'en';
    updateLanguage(lang);

    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('show');

    const onClose = () => closePromoModal(modal);
    if (closeBtn) closeBtn.addEventListener('click', onClose);

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            sessionStorage.setItem(SESSION_KEY, 'true');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) onClose();
    });
}

export function initPromoModal() {
    if (shouldSkipPromo()) return;

    window.addEventListener('9sec:langChange', () => {
        const modal = document.getElementById('promo-modal');
        if (!modal) return;
        const lang = localStorage.getItem('9sec_lang') || 'en';
        updateLanguage(lang);
    });

    setTimeout(injectPromoModal, 500);
}
