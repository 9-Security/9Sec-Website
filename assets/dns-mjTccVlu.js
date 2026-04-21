const J = "https://api.nine-security.com";
let B = null;

function m(e) { return e == null ? "" : String(e).replace(/[&<>"']/g, s => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[s])); }
function Tn() { 
    const e = document.getElementById("sidebar-toggle"), t = document.getElementById("sidebar");
    if(e && t) e.onclick = () => t.classList.toggle("collapsed");
}
function Gn() { console.log("Security modules online."); }
function We() { 
    ["log-filter", "log-from", "log-to"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
    R(1); 
}

// 智慧請求器：支援 Cookie 與 Token 雙模式
async function f(path, method="GET", body=null) {
    const token = localStorage.getItem("9sec_token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body) headers["Content-Type"] = "application/json";

    const opts = { method, headers, credentials: "include" };
    if (body) opts.body = JSON.stringify(body);

    const r = await fetch(J + path, opts);
    
    if (r.status === 401 && !path.includes("/auth/login")) {
        B = null;
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
            return;
        }
    } catch(e) {}
    document.getElementById("login-overlay").style.display = "flex";
}

async function He(){
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;
    const errEl = document.getElementById("login-error");
    try {
        const a = await f("/api/auth/login", "POST", { email, password });
        if(a.ok) {
            // 如果後端有回傳 token，存入 localStorage 繞過 Cookie 攔截
            if (a.token) localStorage.setItem("9sec_token", a.token);
            await he();
        } else {
            if(errEl) { errEl.textContent = a.error || "Login Failed"; errEl.style.display = "block"; }
        }
    } catch(e) { alert("API Connection Failed."); }
}

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

function de(sec, btn) {
    document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
    if(btn) btn.classList.add("active");
    document.querySelectorAll(".section").forEach(a => a.classList.remove("active"));
    const target = document.getElementById(sec);
    if(target) target.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    he(); Tn(); Gn();
    document.getElementById("login-form")?.addEventListener("submit", e => { e.preventDefault(); He(); });
    ["overview", "event", "audit", "policy", "users", "setting"].forEach(id => {
        document.getElementById("nav-"+id)?.addEventListener("click", e => de(id, e.currentTarget));
    });
    document.getElementById("nav-logout")?.addEventListener("click", () => { 
        localStorage.removeItem("9sec_token");
        location.reload(); 
    });
});

window.Gn = Gn; window.We = We; window.switchSection = de; window.login = He;
window.hideAddBlocklist = () => document.getElementById("blocklist-modal").style.display="none";
window.hideAddAllowlist = () => document.getElementById("allowlist-modal").style.display="none";
