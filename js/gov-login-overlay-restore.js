/**
 * If #gov-login-overlay lost its child elements (sanitizer, bad deploy, etc.),
 * restore the login card before the governance module binds #btnLogin.
 */
(function () {
    function restore() {
        var overlay = document.getElementById("gov-login-overlay");
        if (!overlay) return;
        if (overlay.querySelector("#loginEmail") && overlay.querySelector(".gov-login-card")) return;
        overlay.innerHTML =
            '<a href="services.html" class="gov-login-back">' +
            '<i class="fa-solid fa-chevron-left"></i>' +
            '<span data-i18n="nav.back_to_services">RETURN_TO_SERVICES</span></a>' +
            '<div class="card gov-login-card">' +
            '<div class="logo" style="display:flex;justify-content:center;margin-bottom:1.5rem;">' +
            '<img src="/assets/logo_v2-DUFKW_m4-DUFKW_m4-DUFKW_m4-DUFKW_m4-DUFKW_m4-DUFKW_m4-DUFKW_m4.png" alt="Nine-Security" style="height:56px;">' +
            "</div>" +
            '<p class="terminal-text" style="margin-bottom:0.75rem;font-size:0.85rem;">Accessing Governance Subsystem... <span class="status-ok">[ENCRYPTED]</span></p>' +
            '<h2 style="font-family:var(--font-mono);margin-bottom:0.35rem;font-size:1.35rem;">GOVERNANCE_TERMINAL</h2>' +
            '<p style="color:var(--text-secondary);font-family:var(--font-mono);font-size:0.75rem;margin-bottom:1.75rem;">[AUTHENTICATION_REQUIRED]</p>' +
            '<div id="loginForm">' +
            '<div id="loginMsg" class="msg hidden"></div>' +
            '<input type="email" id="loginEmail" autocomplete="username" class="terminal-input" placeholder="EMAIL_IDENTITY" style="margin-bottom:1rem;">' +
            '<input type="password" id="loginPassword" autocomplete="current-password" class="terminal-input" placeholder="SECRET_PASSPHRASE" style="margin-bottom:1.25rem;">' +
            '<button type="button" id="btnLogin" class="btn primary-btn" style="width:100%;justify-content:center;">INITIALIZE_SESSION</button>' +
            "</div></div>";
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", restore);
    } else {
        restore();
    }
})();
