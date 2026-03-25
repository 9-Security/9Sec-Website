/**
 * Nine-Security Frontend Main Entry Point (Vite / ES Modules)
 */

import { initI18n } from './i18n.js';
import { initParticles } from './particles.js';
import { initNews } from './news.js';
import { initThreatIntel } from './threatIntel.js';
import { initSmtp } from './smtp.js';
import { initTheme, initMobileMenu, initSmoothScroll, initBackToTop } from './ui.js';

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing 9SEC Frontend Modules...");

    // Core UI Services
    initTheme();
    initI18n();
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initParticles();

    // Features
    initNews();
    initThreatIntel();
    initSmtp();

    console.log("9SEC Defense Protocol: [ACTIVE]");
});
