const J = "https://api.nine-security.com";
let B = null;

// [Core] Utility for HTML escaping
function m(e) { return e == null ? "" : String(e).replace(/[&<>"']/g, s => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[s])); }

// [UI] Modal Controls
const ct = () => { const el = document.getElementById("blocklist-modal"); if(el) el.style.display="flex"; };
const Rn = () => { const el = document.getElementById("blocklist-modal"); if(el) el.style.display="none"; };
const dt = () => { const el = document.getElementById("allowlist-modal"); if(el) el.style.display="flex"; };
const rt = () => { const el = document.getElementById("allowlist-modal"); if(el) el.style.display="none"; };
const lt = () => { const el = document.getElementById("user-modal"); if(el) el.style.display="flex"; };
const st = () => { const el = document.getElementById("user-modal"); if(el) el.style.display="none"; };

// [UI] Section Switching
function de(sec, btn) {
    console.log("Switching to section:", sec);
    document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
    if(btn) {
        btn.classList.add("active");
    } else {
        const navBtn = document.getElementById("nav-" + sec);
        if(navBtn) navBtn.classList.add("active");
    }
    document.querySelectorAll(".section").forEach(a => a.classList.remove("active"));
    const target = document.getElementById(sec);
    if(target) target.classList.add("active");
}

// [Auth] Smart Requester
async function f(path, method="GET", body=null) {
    const token = localStorage.getItem("9sec_token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body) headers["Content-Type"] = "application/json";
    const opts = { method, headers, credentials: "include" };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(J + path, opts);
    if (r.status === 401 && !path.includes("/auth/login")) {
        document.getElementById("login-overlay").style.display = "flex";
    }
    return r.json();
}

async function he() {
    try {
        const t = await f("/api/user/me");
        if(t.ok && t.user) {
            B = t.user;
            document.getElementById("login-overlay").style.display = "none";
            document.getElementById("user-display").textContent = B.email;
            pt(); R(1);
        }
    } catch(e) {
        document.getElementById("login-overlay").style.display = "flex";
    }
}

async function He(){
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;
    try {
        const a = await f("/api/auth/login", "POST", { email, password });
        if(a.ok) {
            if (a.token) localStorage.setItem("9sec_token", a.token);
            await he();
        } else {
            const errEl = document.getElementById("login-error");
            if(errEl) { errEl.textContent = a.error; errEl.style.display = "block"; }
        }
    } catch(e) { alert("API Error"); }
}

// [Data] Fetchers
async function R(page=1) {
    const res = await f("/api/user/dns-analytics?page=" + page);
    if(res.ok && res.stats) {
        document.getElementById("stat-total").textContent = res.stats.total_queries || 0;
        document.getElementById("stat-clients").textContent = res.stats.unique_clients || 0;
    }
}

async function pt() {
    const res = await f("/api/user/dns-ips");
    if(res.ok && res.data && res.data.length > 0) {
        const el = document.getElementById("resolver-ip");
        if(el) el.textContent = res.data[0].public_ip || "0.0.0.0";
    }
}

// [Init] Startup
document.addEventListener("DOMContentLoaded", () => {
    console.log("HelixDNS Dashboard Initializing...");
    
    // 1. Critical Listeners
    document.getElementById("login-form")?.addEventListener("submit", e => { e.preventDefault(); He(); });
    document.getElementById("sidebar-toggle")?.addEventListener("click", () => document.getElementById("sidebar")?.classList.toggle("collapsed"));
    
    ["overview", "event", "audit", "policy", "users", "setting"].forEach(id => {
        document.getElementById("nav-"+id)?.addEventListener("click", e => de(id, e.currentTarget));
    });

    document.getElementById("nav-logout")?.addEventListener("click", () => { 
        localStorage.removeItem("9sec_token");
        location.reload(); 
    });

    // 2. Action Buttons
    document.getElementById("btn-show-add-block")?.addEventListener("click", ct);
    document.getElementById("btn-show-add-trust")?.addEventListener("click", dt);
    document.getElementById("btn-show-invite-user")?.addEventListener("click", lt);

    // 3. Start Session Check
    he();
});

// [Expose] Make functions available to HTML onclick attributes
window.switchSection = de;
window.login = He;
window.showAddBlocklist = ct;
window.hideAddBlocklist = Rn;
window.showAddAllowlist = dt;
window.hideAddAllowlist = rt;
window.showAddUser = lt;
window.hideAddUser = st;
window.Gn = () => {}; 
window.We = () => { R(1); };
