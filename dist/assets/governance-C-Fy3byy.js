import"./modulepreload-polyfill-B5Qt9EMX.js";const h=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",u="gov_csrf_token";function L(t,e,n){const a=document.getElementById(t);a&&(a.className="msg err",a.textContent=e,a.classList.remove("hidden"))}function w(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function c(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function T(t){return c(t).replace(/"/g,"&quot;")}async function r(t,e={}){var d;const n=h+t,a={...e.headers||{}},i=sessionStorage.getItem(u),l=String(e.method||"GET").toUpperCase();i&&!["GET","HEAD","OPTIONS"].includes(l)&&(a["X-CSRF-Token"]=i);const m={credentials:"include",...e,headers:a},s=await fetch(n,m);if(s.status===401||s.status===403){sessionStorage.removeItem(u);const o=document.getElementById("gov-login-overlay"),f=document.getElementById("gov-authenticated-shell");o&&(o.style.display="flex"),f&&f.classList.add("hidden");return}return(d=s.headers.get("content-type"))!=null&&d.includes("application/json")?await s.json():s}function y(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),_(),E(),g("Overview")}function g(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),S()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),B()}}async function _(){const t=await r("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(u,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function E(){const t=document.getElementById("insightsArea");if(!t)return;const e=await r("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,a=n.environments||[],i=n.summary||{};if(a.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const l=i.overall_score_avg!=null?Math.round(i.overall_score_avg):0,m=i.latest_at?new Date(i.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${l>=75?"var(--accent-color)":l>=45?"#fbbf24":"#ff0055"}">${l}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${m}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${i.environment_count||a.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;a.forEach(function(d){const o=d.report,f=c(d.env_name||d.environment_id||"—"),b=((o==null?void 0:o.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${f}
                        <span class="score-badge lvl-${b}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${c((o==null?void 0:o.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,o?(s+='<div class="domain-grid">',(d.domains||[]).forEach(function(p){const v=p.score!=null?Math.round(p.score):0,I=v>=90?"lvl-a":v>=75?"lvl-b":v>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${c(p.domain_name)}</span>
                            <span class="domain-score ${I}">${c(v)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${v}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function S(){const t=document.getElementById("envsArea");if(t)try{const e=await r("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${c(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${c(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${T(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>k(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function k(t){const e=await r("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(h+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function B(){const t=document.getElementById("auditArea");if(!t)return;const e=await r("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${c(n.action)}</span> 
                <span>${c(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),a=document.getElementById("dashTabAudit"),i=document.getElementById("btnRefresh"),l=document.getElementById("btnLogout"),m=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>g("Overview")),e&&e.addEventListener("click",()=>g("Compliance")),n&&n.addEventListener("click",()=>g("Environments")),a&&a.addEventListener("click",()=>g("Audit")),i&&i.addEventListener("click",()=>{E(),w("Synchronizing with Governance Cluster...")}),l&&l.addEventListener("click",async()=>{sessionStorage.removeItem(u),await r("/api/governance/logout",{method:"POST"}),location.reload()}),m&&m.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,o=await r("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:d})});o.ok?(o.csrf_token&&sessionStorage.setItem(u,o.csrf_token),y()):L("loginMsg",o.error||"Access Denied")}),(async()=>{const s=await r("/api/governance/me");s&&s.ok&&y()})()});
