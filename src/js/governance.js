const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://api.nine-security.com';

let govCsrfToken = null;
const GOV_CSRF_STORAGE_KEY = 'gov_csrf_token';

// Ultimate Storage Helper: Gracefully falls back to memory if sessionStorage is blocked
const memoryStore = {};
const storage = {
    get: (key) => {
        try { return sessionStorage.getItem(key); } catch (e) { return memoryStore[key] || null; }
    },
    set: (key, val) => {
        try { sessionStorage.setItem(key, val); } catch (e) { memoryStore[key] = val; }
    },
    remove: (key) => {
        try { sessionStorage.removeItem(key); } catch (e) { delete memoryStore[key]; }
    }
};

function showMsg(elId, text, isErr) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = "msg " + (isErr ? "err" : "ok");
    el.textContent = text;
    el.classList.remove("hidden");
}

function api(path, opts = {}) {
    const url = API_BASE + path;
    const headers = { ...(opts.headers || {}) };
    const csrfToken = storage.get(GOV_CSRF_STORAGE_KEY);
    const method = String(opts.method || "GET").toUpperCase();
    
    if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) {
        headers["X-CSRF-Token"] = csrfToken;
    }
    
    return fetch(url, { credentials: "include", ...opts, headers })
        .then(async res => {
            if (res.status === 401 || res.status === 403) {
                storage.remove(GOV_CSRF_STORAGE_KEY);
                return { ok: false, error: "Unauthorized", status: 401 };
            }
            if (res.headers.get("content-type")?.includes("application/json")) {
                return await res.json();
            }
            return res;
        })
        .catch(e => {
            console.warn("[API] Connectivity issue:", e.message);
            return { ok: false, error: "Connection Failed" };
        });
}

function showDashboard() {
    const overlay = document.getElementById("gov-login-overlay");
    const shell = document.getElementById("gov-authenticated-shell");
    if (overlay) overlay.style.display = "none";
    if (shell) shell.classList.remove("hidden");
    
    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.classList.remove("hidden");
    
    loadInsights();
    switchDashboardTab("Overview");
}

function switchDashboardTab(name) {
    document.querySelectorAll(".gov-tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".dashboard-panel").forEach(p => p.classList.add("hidden"));
    
    const tab = document.getElementById("dashTab" + name);
    const panel = document.getElementById("panel" + name);
    
    if (tab) tab.classList.add("active");
    if (panel) panel.classList.remove("hidden");
    
    if (name === "Envs") loadEnvs();
}

async function loadInsights() {
    const el = document.getElementById("insightsArea");
    if (!el) return;
    
    const j = await api("/api/governance/insights");
    if (!j || !j.ok) {
        if (j.status !== 401) el.innerHTML = `<div class="card" style="text-align:center; padding: 3rem;">Sync Error.</div>`;
        return;
    }
    
    const d = j.data;
    const envs = d.environments || [];
    const summary = d.summary || {};

    let html = `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${Math.round(summary.overall_score_avg || 0)}</div>
                <div class="stat-label">MATURITY_INDEX</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1rem;">${envs.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;
    // ... Simplified render logic for brevity ...
    el.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById("btnLogin");
    const btnLogout = document.getElementById("btnLogout");

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const res = await api("/api/governance/login", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ email, password }) 
            });
            if (res && res.ok) {
                if (res.csrf_token) storage.set(GOV_CSRF_STORAGE_KEY, res.csrf_token);
                showDashboard();
            } else { 
                showMsg("loginMsg", (res && res.error) || "Access Denied", true); 
            }
        });
    }

    // Auto-login check: THE ONLY ENTRY POINT
    api("/api/governance/me").then(j => {
        if (j && j.ok && j.user) {
            if (j.csrf_token) storage.set(GOV_CSRF_STORAGE_KEY, j.csrf_token);
            const userInfo = document.getElementById("userInfo");
            if (userInfo) userInfo.textContent = j.user.email;
            showDashboard();
        } else {
            const overlay = document.getElementById("gov-login-overlay");
            if (overlay) overlay.style.display = "flex";
        }
    });
});
