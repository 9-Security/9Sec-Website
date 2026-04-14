import { fetchThreatIntel } from './api.js';
import { t } from './i18n.js';

const THREAT_INTEL_CISA_INITIAL = 8;
const THREAT_INTEL_OTX_INITIAL = 5;

let globalThreatList = [];

function createMoreButton(text, className, isAll, remaining, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.expanded = String(isAll);
    button.dataset.remaining = String(remaining);
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

/**
 * Render individual threat intel item.
 */
function renderOneItem(t, showSourceBadge) {
    const lang = localStorage.getItem("9sec_lang") || "en";
    const content = (lang === "tw") ? (t.tw || t) : (lang === "jp" ? (t.jp || t) : (t.en || t));
    const detailLabel = "CVE"; // Standard placeholder or from t()

    const article = document.createElement('article');
    article.className = 'list-item threat-intel-item';

    const date = document.createElement('div');
    date.className = 'date';
    if (showSourceBadge) {
        const sourceBadge = document.createElement('span');
        sourceBadge.className = `source-badge source-${String(t.source || 'cisa')}`;
        sourceBadge.setAttribute('data-i18n', `threat_intel.source_${(t.source === 'otx') ? 'otx' : 'cisa'}`);
        sourceBadge.textContent = (t.source === 'otx') ? 'OTX' : 'CISA';
        date.appendChild(sourceBadge);
        date.append(document.createTextNode(' '));
    }
    date.append(document.createTextNode(String(t.date || '')));
    if (t.is_ai) {
        date.append(document.createTextNode(' '));
        const aiBadge = document.createElement('span');
        aiBadge.className = 'ai-badge ai-badge-small';
        aiBadge.textContent = 'AI';
        date.appendChild(aiBadge);
    }

    const contentWrap = document.createElement('div');
    contentWrap.className = 'content';
    const title = document.createElement('h3');
    if (t.severity === 'high') {
        const severityBadge = document.createElement('span');
        severityBadge.className = 'severity-badge severity-high';
        severityBadge.setAttribute('data-i18n', 'threat_intel.ransomware');
        severityBadge.textContent = 'Ransomware';
        title.appendChild(severityBadge);
    }
    title.append(document.createTextNode(String(content.title || '')));
    const excerpt = document.createElement('p');
    excerpt.textContent = String(content.excerpt || '');
    contentWrap.append(title, excerpt);

    const action = document.createElement('div');
    action.className = 'action';
    const link = document.createElement('a');
    link.href = String(t.url || '#');
    link.className = 'read-btn';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = detailLabel;
    action.appendChild(link);

    article.append(date, contentWrap, action);
    return article;
}

/**
 * Factory for creating threat intel more/less handlers.
 */
function makeThreatHandler(list, initialCount, listClass, moreWrapClass, btnClass) {
    let showing = initialCount;
    const render = (count) => {
        showing = count;
        const n = Math.min(count, list.length);
        return list.slice(0, n).map((item) => renderOneItem(item, false));
    };

    const onClick = (e) => {
        const next = showing >= list.length ? initialCount : list.length;
        const listEl = document.querySelector(`.${listClass}`);
        const wrap = document.querySelector(`.${moreWrapClass}`);
        if (listEl) listEl.replaceChildren(...render(next));

        if (wrap) {
            const isAll = next >= list.length;
            const remaining = list.length - Math.min(next, list.length);
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.replaceChildren(createMoreButton(btnText, `articles-more-btn threat-intel-more-btn ${btnClass}`, isAll, remaining, onClick));
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
            const p = document.createElement('p');
            p.className = 'placeholder-text';
            p.textContent = t("threat_intel.empty", "No records found");
            threatIntelContent.replaceChildren(p);
            return;
        }

        globalThreatList = list;
        const cisaList = list.filter((t) => t.source !== "otx");
        const otxList = list.filter((t) => t.source === "otx");

        const cisaHandler = makeThreatHandler(cisaList, THREAT_INTEL_CISA_INITIAL, "threat-intel-cisa-list", "threat-intel-cisa-more", "threat-intel-cisa-btn");
        const otxHandler = makeThreatHandler(otxList, THREAT_INTEL_OTX_INITIAL, "threat-intel-otx-list", "threat-intel-otx-more", "threat-intel-otx-btn");

        threatIntelContent.className = "threat-intel-content threat-intel-split" + (cisaList.length && otxList.length ? " threat-intel-split-two" : "");
        const splitInner = document.createElement('div');
        splitInner.className = 'threat-intel-split-inner';

        if (cisaList.length > 0) {
            const group = document.createElement('div');
            group.className = 'threat-intel-group threat-intel-cisa';
            const heading = document.createElement('h3');
            heading.className = 'threat-intel-group-title';
            heading.setAttribute('data-i18n', 'threat_intel.heading_cisa');
            heading.textContent = t("threat_intel.heading_cisa", "CISA KEV");
            const listWrap = document.createElement('div');
            listWrap.className = 'list-layout threat-intel-cisa-list';
            listWrap.replaceChildren(...cisaHandler.render(cisaHandler.showing));
            const moreWrap = document.createElement('div');
            moreWrap.className = 'threat-intel-more-wrap threat-intel-cisa-more';
            group.append(heading, listWrap, moreWrap);
            splitInner.appendChild(group);
        }

        if (otxList.length > 0) {
            const group = document.createElement('div');
            group.className = 'threat-intel-group threat-intel-otx';
            const heading = document.createElement('h3');
            heading.className = 'threat-intel-group-title';
            heading.setAttribute('data-i18n', 'threat_intel.heading_otx');
            heading.textContent = t("threat_intel.heading_otx", "OTX Pulses");
            const listWrap = document.createElement('div');
            listWrap.className = 'list-layout threat-intel-otx-list';
            listWrap.replaceChildren(...otxHandler.render(otxHandler.showing));
            const moreWrap = document.createElement('div');
            moreWrap.className = 'threat-intel-more-wrap threat-intel-otx-more';
            group.append(heading, listWrap, moreWrap);
            splitInner.appendChild(group);
        }

        threatIntelContent.replaceChildren(splitInner);

        // Attach initial buttons if needed
        if (cisaList.length > THREAT_INTEL_CISA_INITIAL) {
            const wrap = threatIntelContent.querySelector(".threat-intel-cisa-more");
            const isAll = cisaHandler.showing >= cisaList.length;
            const remaining = cisaList.length - cisaHandler.showing;
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.replaceChildren(createMoreButton(btnText, "articles-more-btn threat-intel-more-btn threat-intel-cisa-btn", isAll, remaining, cisaHandler.onClick));
        }

        if (otxList.length > THREAT_INTEL_OTX_INITIAL) {
            const wrap = threatIntelContent.querySelector(".threat-intel-otx-more");
            const isAll = otxHandler.showing >= otxList.length;
            const remaining = otxList.length - otxHandler.showing;
            const btnText = isAll ? t("threat_intel.collapse", "Collapse") : t("threat_intel.show_more", "Show more ({n})").replace("{n}", remaining.toString());
            wrap.replaceChildren(createMoreButton(btnText, "articles-more-btn threat-intel-more-btn threat-intel-otx-btn", isAll, remaining, otxHandler.onClick));
        }

    } catch (e) {
        threatIntelContent.className = "threat-intel-content threat-intel-placeholder";
        const p = document.createElement('p');
        p.className = 'placeholder-text';
        p.textContent = t("threat_intel.load_error", "Error loading");
        threatIntelContent.replaceChildren(p);
    }
}

// Re-render on language change if needed, though most things are handled via data-i18n or re-init
window.addEventListener('9sec:langChange', () => {
    if (globalThreatList.length > 0) {
        initThreatIntel(); // Simpler than complex partial re-render
    }
});
