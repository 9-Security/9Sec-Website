import { fetchArticles } from './api.js';
import { t } from './i18n.js';

const ARTICLES_INITIAL = 6;
let globalNewsList = [];
let newsShowingCount = ARTICLES_INITIAL;

function buildNewsArticle(item) {
    const lang = localStorage.getItem("9sec_lang") || "en";
    const content = (lang === "tw") ? (item.tw || item) : (lang === "jp" ? (item.jp || item) : (item.en || item));

    const article = document.createElement('article');
    article.className = 'list-item';

    const date = document.createElement('div');
    date.className = 'date';
    date.append(document.createTextNode(String(item.date || '')));
    if (item.is_ai) {
        date.append(document.createTextNode(' '));
        const badge = document.createElement('span');
        badge.className = 'ai-badge';
        badge.textContent = 'AI Summary';
        date.appendChild(badge);
    }

    const contentWrap = document.createElement('div');
    contentWrap.className = 'content';
    const title = document.createElement('h3');
    title.textContent = String(content.title || '');
    const excerpt = document.createElement('p');
    excerpt.textContent = String(content.excerpt || '');
    contentWrap.append(title, excerpt);

    const action = document.createElement('div');
    action.className = 'action';
    const link = document.createElement('a');
    link.className = 'read-btn';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.href = String(item.url || '#');
    link.textContent = 'READ';
    action.appendChild(link);

    article.append(date, contentWrap, action);
    return article;
}

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

    articlesContainer.replaceChildren(...slice.map(buildNewsArticle));

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

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'articles-more-btn';
        button.dataset.expanded = String(isAll);
        button.dataset.remaining = String(remaining);
        button.textContent = btnText;
        button.onclick = () => {
            renderNews(list, isAll ? ARTICLES_INITIAL : list.length);
        };
        btnWrap.replaceChildren(button);
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
