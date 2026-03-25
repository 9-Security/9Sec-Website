import { fetchArticles } from './api.js';
import { escapeHtml } from './utils.js';
import { t } from './i18n.js';

const ARTICLES_INITIAL = 6;
let globalNewsList = [];
let newsShowingCount = ARTICLES_INITIAL;

/**
 * Render security news list.
 */
export function renderNews(list, count) {
    const articlesSection = document.querySelector("#security-news");
    const articlesContainer = document.querySelector("#security-news .list-layout");
    if (!articlesContainer) return;

    newsShowingCount = count;
    const countToShow = Math.min(count, list.length);
    const slice = list.slice(0, countToShow);

    articlesContainer.innerHTML = slice.map((a) => {
        const lang = localStorage.getItem("9sec_lang") || "en";
        const content = (lang === "tw") ? (a.tw || a) : (lang === "jp" ? (a.jp || a) : (a.en || a));
        const aiBadge = a.is_ai ? `<span class="ai-badge">AI Summary</span>` : "";

        return `
        <article class="list-item">
            <div class="date">${escapeHtml(a.date || "")} ${aiBadge}</div>
            <div class="content">
                <h3>${escapeHtml(content.title || "")}</h3>
                <p>${escapeHtml(content.excerpt || "")}</p>
            </div>
            <div class="action">
                <a href="${escapeHtml(a.url || "#")}" class="read-btn" target="_blank" rel="noopener noreferrer">READ</a>
            </div>
        </article>
        `;
    }).join("");

    let btnWrap = articlesSection.querySelector(".articles-more-wrap");
    if (list.length > ARTICLES_INITIAL) {
        if (!btnWrap) {
            btnWrap = document.createElement("div");
            btnWrap.className = "articles-more-wrap";
            articlesSection.querySelector(".container").appendChild(btnWrap);
        }
        const isAll = countToShow >= list.length;
        const remaining = list.length - countToShow;
        const btnText = isAll ? t("articles.collapse", "Collapse") : t("articles.show_more", "Show more ({n})").replace("{n}", remaining.toString());

        btnWrap.innerHTML = `<button type="button" class="articles-more-btn" data-expanded="${isAll}" data-remaining="${remaining}">${escapeHtml(btnText)}</button>`;
        btnWrap.querySelector("button").onclick = () => {
            renderNews(list, isAll ? ARTICLES_INITIAL : list.length);
        };
    } else if (btnWrap) btnWrap.remove();
}

/**
 * Initialize news loading.
 */
export async function initNews() {
    const list = await fetchArticles();
    if (list && list.length > 0) {
        globalNewsList = list;
        renderNews(list, ARTICLES_INITIAL);
    }
}

// Subscribe to language change events to re-render local text
window.addEventListener('9sec:langChange', () => {
    if (globalNewsList.length > 0) {
        renderNews(globalNewsList, newsShowingCount);
    }
});
