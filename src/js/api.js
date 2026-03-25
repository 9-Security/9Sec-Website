import { API_BASE } from './utils.js';

/**
 * Fetch generic data from the API.
 */
async function fetchApi(path) {
    try {
        const r = await fetch(`${API_BASE}${path}`);
        if (!r.ok) return [];
        return await r.json();
    } catch (e) {
        console.error(`API Fetch Error [${path}]:`, e);
        return [];
    }
}

/**
 * Fetch latest security articles.
 */
export function fetchArticles() {
    return fetchApi('/api/articles');
}

/**
 * Fetch threat intelligence data.
 */
export function fetchThreatIntel() {
    return fetchApi('/api/threat-intel');
}

/**
 * Initialize an assessment session.
 */
export async function startAssessment(email, consent) {
    try {
        const resp = await fetch(`${API_BASE}/api/assessment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, consent })
        });
        return await resp.json();
    } catch (e) {
        console.error("Assessment Start Error:", e);
        throw e;
    }
}

/**
 * Check assessment status.
 */
export async function getAssessmentStatus(id) {
    const resp = await fetch(`${API_BASE}/api/assessment/${id}`);
    if (!resp.ok) throw new Error(`HTTP Error ${resp.status}`);
    return await resp.json();
}

/**
 * Get the full forensic report.
 */
export async function getAssessmentReport(id) {
    const resp = await fetch(`${API_BASE}/api/assessment/${id}/report`);
    if (!resp.ok) throw new Error(`HTTP Error ${resp.status}`);
    return await resp.json();
}
