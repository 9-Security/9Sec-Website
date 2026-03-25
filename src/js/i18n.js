import { translations } from './translations.js';

/**
 * Get translation for a given path and fallback.
 */
export function t(path, fallback) {
    const lang = localStorage.getItem("9sec_lang") || "en";
    const obj = translations[lang] || translations.en;
    const keys = path.split(".");
    let val = obj;
    for (const k of keys) {
        if (val == null) return fallback;
        val = val[k];
    }
    return val != null && val !== "" ? val : fallback;
}

/**
 * Detect browser language and map to supported codes (tw, jp, en).
 */
export function getBrowserLang() {
    const raw = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const list = navigator.languages ? [...navigator.languages] : [raw];
    for (const l of list) {
        const code = (l || '').toLowerCase().split('-')[0];
        if (code === 'zh') return 'tw';
        if (code === 'ja') return 'jp';
    }
    if (raw.startsWith('zh')) return 'tw';
    if (raw.startsWith('ja')) return 'jp';
    return 'en';
}

/**
 * Update the UI elements with translated text.
 */
export function updateLanguage(lang) {
    const langBtn = document.getElementById('current-lang');
    if (langBtn) langBtn.textContent = lang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let val = translations[lang];
        keys.forEach(k => {
            if (val) val = val[k];
        });

        if (val) {
            element.innerHTML = val;
        }
    });

    // Custom labels that need logic
    document.querySelectorAll('#security-news .articles-more-btn').forEach(btn => {
        const isAll = btn.dataset.expanded === 'true';
        const remaining = parseInt(btn.dataset.remaining, 10) || 0;
        btn.textContent = isAll ? t("articles.collapse", "Collapse") : t("articles.show_more", "Show more ({n})").replace("{n}", remaining.toString());
    });

    document.querySelectorAll('.threat-intel-more-btn').forEach(btn => {
        const isAll = btn.dataset.expanded === 'true';
        const remaining = parseInt(btn.dataset.remaining, 10) || 0;
        btn.textContent = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
    });
}

/**
 * Setup language selector UI and listeners.
 */
export function initI18n() {
    const langOptions = document.querySelectorAll('.lang-menu li');
    const savedLang = localStorage.getItem('9sec_lang') || getBrowserLang();

    updateLanguage(savedLang);

    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            localStorage.setItem('9sec_lang', lang);
            updateLanguage(lang);
            // Trigger a custom event for other modules to re-render if needed
            window.dispatchEvent(new CustomEvent('9sec:langChange', { detail: lang }));
        });
    });
}
