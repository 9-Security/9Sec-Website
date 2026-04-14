import"./modulepreload-polyfill-B5Qt9EMX.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();const k=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",E="gov_csrf_token";function x(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function O(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function v(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function A(t){return v(t).replace(/"/g,"&quot;")}async function g(t,e={}){var n;const o=k+t,a={...e.headers||{}},i=sessionStorage.getItem(E),c=String(e.method||"GET").toUpperCase();i&&!["GET","HEAD","OPTIONS"].includes(c)&&(a["X-CSRF-Token"]=i);const s={credentials:"include",...e,headers:a},r=await fetch(o,s);if(r.status===401||r.status===403){sessionStorage.removeItem(E);const d=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");d&&(d.style.display="flex"),m&&m.classList.add("hidden");return}return(n=r.headers.get("content-type"))!=null&&n.includes("application/json")?await r.json():r}function w(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),C(),B(),f("Overview")}function f(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),$()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),N()}}async function C(){const t=await g("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(E,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function B(){const t=document.getElementById("insightsArea");if(!t)return;const e=await g("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],a=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const i=a.overall_score_avg!=null?Math.round(a.overall_score_avg):0,c=a.latest_at?new Date(a.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${i>=75?"var(--accent-color)":i>=45?"#fbbf24":"#ff0055"}">${i}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${c}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${a.environment_count||o.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;o.forEach(function(r){const d=r.report,m=v(r.env_name||r.environment_id||"—"),b=((d==null?void 0:d.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${b}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${v((d==null?void 0:d.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,d?(s+='<div class="domain-grid">',(r.domains||[]).forEach(function(y){const l=y.score!=null?Math.round(y.score):0,I=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${v(y.domain_name)}</span>
                            <span class="domain-score ${I}">${v(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function $(){const t=document.getElementById("envsArea");if(t)try{const e=await g("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${v(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${v(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${A(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>M(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function M(t){const e=await g("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(k+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function N(){const t=document.getElementById("auditArea");if(!t)return;const e=await g("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${v(n.action)}</span> 
                <span>${v(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),a=document.getElementById("btnRefresh"),i=document.getElementById("btnLogout"),c=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>f("Overview")),e&&e.addEventListener("click",()=>f("Compliance")),n&&n.addEventListener("click",()=>f("Environments")),o&&o.addEventListener("click",()=>f("Audit")),a&&a.addEventListener("click",()=>{B(),O("Synchronizing with Governance Cluster...")}),i&&i.addEventListener("click",async()=>{sessionStorage.removeItem(E),await g("/api/governance/logout",{method:"POST"}),location.reload()}),c&&c.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,r=document.getElementById("loginPassword").value,d=await g("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:r})});d.ok?(d.csrf_token&&sessionStorage.setItem(E,d.csrf_token),w()):x("loginMsg",d.error||"Access Denied")}),(async()=>{const s=await g("/api/governance/me");s&&s.ok&&w()})()});const _=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",L="gov_csrf_token";function D(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function R(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function u(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function j(t){return u(t).replace(/"/g,"&quot;")}async function p(t,e={}){var n;const o=_+t,a={...e.headers||{}},i=sessionStorage.getItem(L),c=String(e.method||"GET").toUpperCase();i&&!["GET","HEAD","OPTIONS"].includes(c)&&(a["X-CSRF-Token"]=i);const s={credentials:"include",...e,headers:a},r=await fetch(o,s);if(r.status===401||r.status===403){sessionStorage.removeItem(L);const d=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");d&&(d.style.display="flex"),m&&m.classList.add("hidden");return}return(n=r.headers.get("content-type"))!=null&&n.includes("application/json")?await r.json():r}function T(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),P(),S(),h("Overview")}function h(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),z()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),q()}}async function P(){const t=await p("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(L,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function S(){const t=document.getElementById("insightsArea");if(!t)return;const e=await p("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],a=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const i=a.overall_score_avg!=null?Math.round(a.overall_score_avg):0,c=a.latest_at?new Date(a.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${i>=75?"var(--accent-color)":i>=45?"#fbbf24":"#ff0055"}">${i}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${c}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${a.environment_count||o.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;o.forEach(function(r){const d=r.report,m=u(r.env_name||r.environment_id||"—"),b=((d==null?void 0:d.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${b}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${u((d==null?void 0:d.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,d?(s+='<div class="domain-grid">',(r.domains||[]).forEach(function(y){const l=y.score!=null?Math.round(y.score):0,I=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${u(y.domain_name)}</span>
                            <span class="domain-score ${I}">${u(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function z(){const t=document.getElementById("envsArea");if(t)try{const e=await p("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${u(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${u(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${j(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>H(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function H(t){const e=await p("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(_+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function q(){const t=document.getElementById("auditArea");if(!t)return;const e=await p("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${u(n.action)}</span> 
                <span>${u(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),a=document.getElementById("btnRefresh"),i=document.getElementById("btnLogout"),c=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>h("Overview")),e&&e.addEventListener("click",()=>h("Compliance")),n&&n.addEventListener("click",()=>h("Environments")),o&&o.addEventListener("click",()=>h("Audit")),a&&a.addEventListener("click",()=>{S(),R("Synchronizing with Governance Cluster...")}),i&&i.addEventListener("click",async()=>{sessionStorage.removeItem(L),await p("/api/governance/logout",{method:"POST"}),location.reload()}),c&&c.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,r=document.getElementById("loginPassword").value,d=await p("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:r})});d.ok?(d.csrf_token&&sessionStorage.setItem(L,d.csrf_token),T()):D("loginMsg",d.error||"Access Denied")}),(async()=>{const s=await p("/api/governance/me");s&&s.ok&&T()})()});
