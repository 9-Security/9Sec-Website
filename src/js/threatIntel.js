import { fetchThreatIntel } from './api.js';
import { escapeHtml } from './utils.js';
import { t } from './i18n.js';

const THREAT_INTEL_CISA_INITIAL = 8;
const THREAT_INTEL_OTX_INITIAL = 5;

let globalThreatList = [];

/**
 * Render individual threat intel item.
 */
function renderOneItem(t, showSourceBadge) {
    const lang = localStorage.getItem("9sec_lang") || "en";
    const content = (lang === "tw") ? (t.tw || t) : (lang === "jp" ? (t.jp || t) : (t.en || t));
    const aiBadge = t.is_ai ? `<span class="ai-badge ai-badge-small">AI</span>` : "";

    const severityBadge = (t.severity === "high")
        ? `<span class="severity-badge severity-high" data-i18n="threat_intel.ransomware">Ransomware</span>`
        : "";
    const sourceBadge = showSourceBadge
        ? `<span class="source-badge source-${escapeHtml((t.source || "cisa"))}" data-i18n="threat_intel.source_${(t.source === "otx") ? "otx" : "cisa"}">${(t.source === "otx") ? "OTX" : "CISA"}</span> `
        : "";
    const detailLabel = "CVE"; // Standard placeholder or from t()
    return `
        <article class="list-item threat-intel-item">
            <div class="date">${sourceBadge}${escapeHtml(t.date || "")} ${aiBadge}</div>
            <div class="content">
                <h3>${severityBadge}${escapeHtml(content.title || "")}</h3>
                <p>${escapeHtml(content.excerpt || "")}</p>
            </div>
            <div class="action">
                <a href="${escapeHtml(t.url || "#")}" class="read-btn" target="_blank" rel="noopener noreferrer">${escapeHtml(detailLabel)}</a>
            </div>
        </article>
    `;
}

/**
 * Factory for creating threat intel more/less handlers.
 */
function makeThreatHandler(list, initialCount, listClass, moreWrapClass, btnClass) {
    let showing = initialCount;
    const render = (count) => {
        showing = count;
        const n = Math.min(count, list.length);
        return list.slice(0, n).map((item) => renderOneItem(item, false)).join("");
    };

    const onClick = (e) => {
        const next = showing >= list.length ? initialCount : list.length;
        const listEl = document.querySelector(`.${listClass}`);
        const wrap = document.querySelector(`.${moreWrapClass}`);
        if (listEl) listEl.innerHTML = render(next);

        if (wrap) {
            const isAll = next >= list.length;
            const remaining = list.length - Math.min(next, list.length);
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.innerHTML = `<button type="button" class="articles-more-btn threat-intel-more-btn ${btnClass}" data-expanded="${isAll}" data-remaining="${remaining}">${escapeHtml(btnText)}</button>`;
            wrap.querySelector("button").onclick = onClick;
        }
    };

    return { render, onClick, showing };
}

/**
 * Initialize threat intelligence view.
 */
export async function initThreatIntel() {
    const threatIntelContent = document.getElementById("threat-intel-content");
    if (!threatIntelContent) return;

    try {
        const list = await fetchThreatIntel();
        if (!list || list.length === 0) {
            threatIntelContent.className = "threat-intel-content threat-intel-placeholder";
            threatIntelContent.innerHTML = `<p class="placeholder-text">${escapeHtml(t("threat_intel.empty", "No records found"))}</p>`;
            return;
        }

        globalThreatList = list;
        const cisaList = list.filter((t) => t.source !== "otx");
        const otxList = list.filter((t) => t.source === "otx");

        const cisaHandler = makeThreatHandler(cisaList, THREAT_INTEL_CISA_INITIAL, "threat-intel-cisa-list", "threat-intel-cisa-more", "threat-intel-cisa-btn");
        const otxHandler = makeThreatHandler(otxList, THREAT_INTEL_OTX_INITIAL, "threat-intel-otx-list", "threat-intel-otx-more", "threat-intel-otx-btn");

        const cisaHtml = cisaList.length === 0 ? "" : `
            <div class="threat-intel-group threat-intel-cisa">
                <h3 class="threat-intel-group-title" data-i18n="threat_intel.heading_cisa">${escapeHtml(t("threat_intel.heading_cisa", "CISA KEV"))}</h3>
                <div class="list-layout threat-intel-cisa-list">${cisaHandler.render(cisaHandler.showing)}</div>
                <div class="threat-intel-more-wrap threat-intel-cisa-more"></div>
            </div>`;

        const otxHtml = otxList.length === 0 ? "" : `
            <div class="threat-intel-group threat-intel-otx">
                <h3 class="threat-intel-group-title" data-i18n="threat_intel.heading_otx">${escapeHtml(t("threat_intel.heading_otx", "OTX Pulses"))}</h3>
                <div class="list-layout threat-intel-otx-list">${otxHandler.render(otxHandler.showing)}</div>
                <div class="threat-intel-more-wrap threat-intel-otx-more"></div>
            </div>`;

        threatIntelContent.className = "threat-intel-content threat-intel-split" + (cisaList.length && otxList.length ? " threat-intel-split-two" : "");
        threatIntelContent.innerHTML = `<div class="threat-intel-split-inner">${cisaHtml}${otxHtml}</div>`;

        // Attach initial buttons if needed
        if (cisaList.length > THREAT_INTEL_CISA_INITIAL) {
            const wrap = threatIntelContent.querySelector(".threat-intel-cisa-more");
            const isAll = cisaHandler.showing >= cisaList.length;
            const remaining = cisaList.length - cisaHandler.showing;
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.innerHTML = `<button type="button" class="articles-more-btn threat-intel-more-btn threat-intel-cisa-btn" data-expanded="${isAll}" data-remaining="${remaining}">${escapeHtml(btnText)}</button>`;
            wrap.querySelector("button").onclick = cisaHandler.onClick;
        }

        if (otxList.length > THREAT_INTEL_OTX_INITIAL) {
            const wrap = threatIntelContent.querySelector(".threat-intel-otx-more");
            const isAll = otxHandler.showing >= otxList.length;
            const remaining = otxList.length - otxHandler.showing;
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.innerHTML = `<button type="button" class="articles-more-btn threat-intel-more-btn threat-intel-otx-btn" data-expanded="${isAll}" data-remaining="${remaining}">${escapeHtml(btnText)}</button>`;
            wrap.querySelector("button").onclick = otxHandler.onClick;
        }

    } catch (e) {
        threatIntelContent.className = "threat-intel-content threat-intel-placeholder";
        threatIntelContent.innerHTML = `<p class="placeholder-text">${escapeHtml(t("threat_intel.load_error", "Error loading"))}</p>`;
    }
}

// Re-render on language change if needed, though most things are handled via data-i18n or re-init
window.addEventListener('9sec:langChange', () => {
    if (globalThreatList.length > 0) {
        initThreatIntel(); // Simpler than complex partial re-render
    }
});
