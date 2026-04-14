const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://api.nine-security.com';

let govCsrfToken = null;
const IDLE_TIMEOUT = 30 * 60 * 1000;
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;
const GOV_CSRF_STORAGE_KEY = 'gov_csrf_token';

function showMsg(elId, text, isErr) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = "msg " + (isErr ? "err" : "ok");
    el.textContent = text;
    el.classList.remove("hidden");
}

function hideMsg(elId) {
    const el = document.getElementById(elId);
    if (el) el.classList.add("hidden");
}

function showToast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => { el.classList.remove("show"); }, 4000);
}

function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
}

async function api(path, opts = {}) {
    const url = API_BASE + path;
    const headers = { ...(opts.headers || {}) };
    const csrfToken = sessionStorage.getItem(GOV_CSRF_STORAGE_KEY);
    const method = String(opts.method || "GET").toUpperCase();
    if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = csrfToken;
    const fetchOpts = { credentials: "include", ...opts, headers };
    const res = await fetch(url, fetchOpts);
    if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem(GOV_CSRF_STORAGE_KEY);
        const overlay = document.getElementById("gov-login-overlay");
        const shell = document.getElementById("gov-authenticated-shell");
        if (overlay) overlay.style.display = "flex";
        if (shell) shell.classList.add("hidden");
        return;
    }
    if (res.headers.get("content-type")?.includes("application/json")) return await res.json();
    return res;
}

function showDashboard() {
    const overlay = document.getElementById("gov-login-overlay");
    const shell = document.getElementById("gov-authenticated-shell");
    if (overlay) overlay.style.display = "none";
    if (shell) shell.classList.remove("hidden");
    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.classList.remove("hidden");
    loadMe();
    loadInsights();
    switchDashboardTab("Overview");
}

function switchDashboardTab(name) {
    document.querySelectorAll(".gov-tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".dashboard-panel").forEach(p => p.classList.add("hidden"));
    if (name === "Overview") {
        const tab = document.getElementById("dashTabOverview");
        const panel = document.getElementById("panelOverview");
        if (tab) tab.classList.add("active");
        if (panel) panel.classList.remove("hidden");
    } else if (name === "Compliance") {
        const tab = document.getElementById("dashTabCompliance");
        const panel = document.getElementById("panelCompliance");
        if (tab) tab.classList.add("active");
        if (panel) panel.classList.remove("hidden");
        // loadComplianceDashboard(); // Assuming this is defined elsewhere or in the same app
    } else if (name === "Environments") {
        const tab = document.getElementById("dashTabEnvs");
        const panel = document.getElementById("panelEnvs");
        if (tab) tab.classList.add("active");
        if (panel) panel.classList.remove("hidden");
        loadEnvs();
    } else if (name === "Audit") {
        const tab = document.getElementById("dashTabAudit");
        const panel = document.getElementById("panelAudit");
        if (tab) tab.classList.add("active");
        if (panel) panel.classList.remove("hidden");
        loadAuditLogs();
    }
}

async function loadMe() {
    const j = await api("/api/governance/me");
    if (j && j.ok && j.user) {
        if (j.csrf_token) sessionStorage.setItem(GOV_CSRF_STORAGE_KEY, j.csrf_token);
        const userInfo = document.getElementById("userInfo");
        if (userInfo) userInfo.textContent = j.user.email;
    }
}

async function loadInsights() {
    const el = document.getElementById("insightsArea");
    if (!el) return;
    const j = await api("/api/governance/insights");
    if (!j || !j.ok) {
        el.innerHTML = `<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>`;
        return;
    }
    const d = j.data;
    const envs = d.environments || [];
    const summary = d.summary || {};

    if (envs.length === 0) {
        el.innerHTML = `<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>`;
        return;
    }

    const avgScore = summary.overall_score_avg != null ? Math.round(summary.overall_score_avg) : 0;
    const latestAt = summary.latest_at ? new Date(summary.latest_at).toLocaleString() : "—";

    let html = `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${avgScore >= 75 ? 'var(--accent-color)' : avgScore >= 45 ? '#fbbf24' : '#ff0055'}">${avgScore}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${latestAt}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.environment_count || envs.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;

    envs.forEach(function (ev) {
        const r = ev.report;
        const name = escapeHtml(ev.env_name || ev.environment_id || "—");
        const riskLvl = (r?.risk_level || 'D').toLowerCase();

        html += `
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${name}
                        <span class="score-badge lvl-${riskLvl}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${escapeHtml(r?.risk_level || 'D')}</span>
                    </h3>
                </div>
        `;

        if (!r) {
            html += `<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>`;
        } else {
            html += `<div class="domain-grid">`;
            (ev.domains || []).forEach(function (x) {
                const dScore = x.score != null ? Math.round(x.score) : 0;
                const dCls = dScore >= 90 ? 'lvl-a' : dScore >= 75 ? 'lvl-b' : dScore >= 60 ? 'lvl-c' : 'lvl-d';
                html += `
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${escapeHtml(x.domain_name)}</span>
                            <span class="domain-score ${dCls}">${escapeHtml(dScore)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${dScore}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
    });

    el.innerHTML = html;
}

async function loadEnvs() {
    const el = document.getElementById("envsArea");
    if (!el) return;
    try {
        const res = await api("/api/governance/environments");
        if (res.ok) {
            el.innerHTML = res.data.map(e => `
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${escapeHtml(e.name || e.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${escapeHtml(e.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${escapeAttr(e.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join("");
            el.querySelectorAll('.js-run-download').forEach((button) => {
                button.addEventListener('click', () => runDirectDownload(button.dataset.envId));
            });
        }
    } catch (e) { el.innerHTML = "Sync Error."; }
}

async function runDirectDownload(envId) {
    const j = await api("/api/governance/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ environment_id: envId }) });
    if (j.ok) { window.open(API_BASE + "/api/governance/download/" + j.data.upload_session_id + "?token=" + encodeURIComponent(j.data.token), "_blank"); }
}

async function loadAuditLogs() {
    const el = document.getElementById("auditArea");
    if (!el) return;
    const j = await api("/api/governance/audit");
    if (j && j.ok) {
        el.innerHTML = j.data.map(a => `
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(a.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${escapeHtml(a.action)}</span> 
                <span>${escapeHtml(a.details || '')}</span>
            </div>
        `).join("") || "No audit logs found.";
    }
}

// Event listeners initialization
document.addEventListener('DOMContentLoaded', () => {
    const tabOverview = document.getElementById("dashTabOverview");
    const tabCompliance = document.getElementById("dashTabCompliance");
    const tabEnvs = document.getElementById("dashTabEnvs");
    const tabAudit = document.getElementById("dashTabAudit");
    const btnRefresh = document.getElementById("btnRefresh");
    const btnLogout = document.getElementById("btnLogout");
    const btnLogin = document.getElementById("btnLogin");

    if (tabOverview) tabOverview.addEventListener('click', () => switchDashboardTab("Overview"));
    if (tabCompliance) tabCompliance.addEventListener('click', () => switchDashboardTab("Compliance"));
    if (tabEnvs) tabEnvs.addEventListener('click', () => switchDashboardTab("Environments"));
    if (tabAudit) tabAudit.addEventListener('click', () => switchDashboardTab("Audit"));
    if (btnRefresh) btnRefresh.addEventListener('click', () => { loadInsights(); showToast("Synchronizing with Governance Cluster..."); });
    if (btnLogout) btnLogout.addEventListener('click', async () => {
        sessionStorage.removeItem(GOV_CSRF_STORAGE_KEY);
        await api("/api/governance/logout", { method: "POST" });
        location.reload();
    });

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const res = await api("/api/governance/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
            if (res.ok) {
                if (res.csrf_token) sessionStorage.setItem(GOV_CSRF_STORAGE_KEY, res.csrf_token);
                showDashboard();
            }
            else { showMsg("loginMsg", res.error || "Access Denied", true); }
        });
    }

    // Auto-login check
    (async () => {
        const res = await api("/api/governance/me");
        if (res && res.ok) showDashboard();
    })();
});
