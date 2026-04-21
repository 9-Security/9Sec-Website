const J = "https://api.nine-security.com";
let B = null;

function m(e) { return e == null ? "" : String(e).replace(/[&<>"']/g, s => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[s])); }

async function he() {
    try {
        const r = await fetch(J + "/api/user/me", { credentials: "include" });
        if (r.status === 401) throw new Error("Unauthorized");
        const t = await r.json();
        if(t.ok && t.user) {
            B = t.user;
            const overlay = document.getElementById("login-overlay");
            if(overlay) overlay.style.display = "none";
            const userDisp = document.getElementById("user-display");
            if(userDisp) userDisp.textContent = B.email;
            pt(); R(1);
            return;
        }
    } catch(e) {
        console.log("Session check: Not logged in or blocked.");
    }
    const overlay = document.getElementById("login-overlay");
    if(overlay) overlay.style.display = "flex";
}

async function He(){
    const emailEl = document.getElementById("login-email");
    const passEl = document.getElementById("login-pass");
    if(!emailEl || !passEl) return;
    
    const email = emailEl.value;
    const password = passEl.value;
    const errEl = document.getElementById("login-error");

    try {
        const r = await fetch(J + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });
        const a = await r.json();
        if(a.ok) {
            await he();
        } else {
            if(errEl) { errEl.textContent = a.error || "Login Failed"; errEl.style.display = "block"; }
            else alert(a.error || "Login Failed");
        }
    } catch(e) {
        alert("Cannot connect to API server. Please check your network or tracking prevention settings.");
    }
}

async function f(path, method="GET", body=null) {
    const opts = { method, headers: {}, credentials: "include" };
    if(body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    const r = await fetch(J + path, opts);
    if(r.status === 401) { B = null; document.getElementById("login-overlay").style.display = "flex"; }
    return r.json();
}

async function R(page=1) {
    try {
        const res = await f("/api/user/dns-analytics?page=" + page);
        if(res.ok && res.stats) {
            const t1 = document.getElementById("stat-total");
            const t2 = document.getElementById("stat-clients");
            if(t1) t1.textContent = res.stats.total_queries || 0;
            if(t2) t2.textContent = res.stats.unique_clients || 0;
        }
    } catch(e) {}
}

async function pt() {
    try {
        const res = await f("/api/user/dns-ips");
        if(res.ok && res.data && res.data.length > 0) {
            const el = document.getElementById("resolver-ip");
            if(el) el.textContent = res.data[0].public_ip || "0.0.0.0";
        }
    } catch(e) {}
}

function de(sec, btn) {
    document.querySelectorAll(".nav-item").forEach(a => a.classList.remove("active"));
    if(btn) btn.classList.add("active");
    document.querySelectorAll(".section").forEach(a => a.classList.remove("active"));
    const target = document.getElementById(sec);
    if(target) target.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    he();
    const toggle = document.getElementById("sidebar-toggle");
    if(toggle) toggle.onclick = () => document.getElementById("sidebar")?.classList.toggle("collapsed");
    
    document.getElementById("nav-logout")?.addEventListener("click", async () => { 
        await fetch(J+"/api/auth/logout", {method:"POST", credentials:"include"}); 
        location.reload(); 
    });
    
    ["overview", "event", "audit", "policy", "users", "setting"].forEach(id => {
        document.getElementById("nav-"+id)?.addEventListener("click", (e) => de(id, e.currentTarget));
    });

    document.getElementById("login-form")?.addEventListener("submit", e => { e.preventDefault(); He(); });
    document.getElementById("btn-show-add-block")?.addEventListener("click", () => document.getElementById("blocklist-modal").style.display="flex");
    document.getElementById("btn-show-add-trust")?.addEventListener("click", () => document.getElementById("allowlist-modal").style.display="flex");
});

window.switchSection = de;
window.hideAddBlocklist = () => document.getElementById("blocklist-modal").style.display="none";
window.hideAddAllowlist = () => document.getElementById("allowlist-modal").style.display="none";
