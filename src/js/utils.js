/**
 * Shared utility functions
 */

export const API_BASE = "https://api.nine-security.com";

export const FREE_EMAIL_DOMAINS = new Set([
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
    "yahoo.com", "yahoo.com.tw", "yahoo.co.jp", "ymail.com", "aol.com", "aim.com",
    "icloud.com", "me.com", "mac.com",
    "protonmail.com", "proton.me", "pm.me",
    "zoho.com", "zohomail.com", "zohomail.eu",
    "mail.com", "gmx.com", "gmx.de",
    "yandex.com", "yandex.ru", "mail.ru",
    "qq.com", "163.com", "126.com", "sina.com", "yeah.net",
    "fastmail.com", "tutanota.com", "tuta.io"
]);

export function escapeHtml(s) {
    if (s == null) return "";
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
}

export function validateEmail(value) {
    if (typeof value !== "string") return "Please enter a valid corporate email.";
    const s = value.trim();
    if (s.length === 0) return "Please enter a valid corporate email.";
    if (s.length > 254) return "Email address is too long.";
    if (/[\x00-\x1F\x7F]/.test(s)) return "Invalid characters in email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Please enter a valid corporate email.";
    const domain = s.split("@")[1];
    if (!domain || domain.length < 4) return "Please enter a valid corporate email.";
    if (FREE_EMAIL_DOMAINS.has(domain.toLowerCase())) return "Please use your corporate/work email. Free email providers are not supported.";
    return null;
}

export function getStatusClass(val) {
    if (val == null) return "fail";
    const lower = String(val).toLowerCase();
    if (["pass", "true", "low", "enforce", "enabled"].includes(lower)) return "pass";
    if (["warn", "none", "medium", "missing", "quarantine/none"].includes(lower)) return "warn";
    return "fail";
}

export function showNotice(msg) {
    // Current monolithic JS has this function, I'll need to define it in UI.js later.
    // I'll emit an event or just call it from UI.
    window.dispatchEvent(new CustomEvent('9sec:notice', { detail: msg }));
}
