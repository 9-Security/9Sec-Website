const J = "https://api.nine-security.com";
let B = null;

function m(e) { return e == null ? "" : String(e).replace(/[&<>"']/g, s => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[s])); }
function Tn() { 
    const e = document.getElementById("sidebar-toggle"), t = document.getElementById("sidebar");
    if(e && t) e.onclick = () => t.classList.toggle("collapsed");
}
function Gn() { console.log("System components initialized."); }
function We() { 
    ["log-filter", "log-from", "log-to"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
    R(1); 
}

async function he() {
    try {
        const r = await fetch(J + "/api/user/me", { credentials: "include" });
        if (r.status === 401) { B = null; document.getElementById("login-overlay").style.display = "flex"; return; }
        const t = await r.json();
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
    try {
        const r = await fetch(J + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });
        const a = await r.json();
        if(a.ok) await he();
        else alert(a.error || "Login Failed");
    } catch(e) { alert("Server connection failed."); }
}

async function f(p, m="GET", b=null) {
    const o = { method:m, headers: {}, credentials: "include" };
    if(b) { o.headers["Content-Type"] = "application/json"; o.body = JSON.stringify(b); }
    const r = await fetch(J + p, o);
    if(r.status === 401) { B = null; document.getElementById("login-overlay").style.display = "flex"; }
    return r.json();
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
    document.getElementById("nav-logout")?.addEventListener("click", async () => { await fetch(J+"/api/auth/logout", {method:"POST", credentials:"include"}); location.reload(); });
    document.getElementById("btn-show-add-block")?.addEventListener("click", () => document.getElementById("blocklist-modal").style.display="flex");
    document.getElementById("btn-show-add-trust")?.addEventListener("click", () => document.getElementById("allowlist-modal").style.display="flex");
});

window.Gn = Gn; window.We = We; window.switchSection = de; window.login = He;
window.hideAddBlocklist = () => document.getElementById("blocklist-modal").style.display="none";
window.hideAddAllowlist = () => document.getElementById("allowlist-modal").style.display="none";
