import"./modulepreload-polyfill-B5Qt9EMX-ulV_1b7r-BGxEsOWE.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();const O=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",T="gov_csrf_token";function D(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function R(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function u(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function j(t){return u(t).replace(/"/g,"&quot;")}async function y(t,e={}){var n;const o=O+t,a={...e.headers||{}},r=sessionStorage.getItem(T),c=String(e.method||"GET").toUpperCase();r&&!["GET","HEAD","OPTIONS"].includes(c)&&(a["X-CSRF-Token"]=r);const s={credentials:"include",...e,headers:a},d=await fetch(o,s);if(d.status===401||d.status===403){sessionStorage.removeItem(T);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(n=d.headers.get("content-type"))!=null&&n.includes("application/json")?await d.json():d}function _(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),P(),A(),I("Overview")}function I(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),z()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),q()}}async function P(){const t=await y("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(T,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function A(){const t=document.getElementById("insightsArea");if(!t)return;const e=await y("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],a=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const r=a.overall_score_avg!=null?Math.round(a.overall_score_avg):0,c=a.latest_at?new Date(a.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${r>=75?"var(--accent-color)":r>=45?"#fbbf24":"#ff0055"}">${r}</div>
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
    `;o.forEach(function(d){const i=d.report,m=u(d.env_name||d.environment_id||"—"),h=((i==null?void 0:i.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${h}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${u((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(s+='<div class="domain-grid">',(d.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${u(v.domain_name)}</span>
                            <span class="domain-score ${b}">${u(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function z(){const t=document.getElementById("envsArea");if(t)try{const e=await y("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${u(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${u(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${j(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>H(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function H(t){const e=await y("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(O+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function q(){const t=document.getElementById("auditArea");if(!t)return;const e=await y("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${u(n.action)}</span> 
                <span>${u(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),a=document.getElementById("btnRefresh"),r=document.getElementById("btnLogout"),c=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>I("Overview")),e&&e.addEventListener("click",()=>I("Compliance")),n&&n.addEventListener("click",()=>I("Environments")),o&&o.addEventListener("click",()=>I("Audit")),a&&a.addEventListener("click",()=>{A(),R("Synchronizing with Governance Cluster...")}),r&&r.addEventListener("click",async()=>{sessionStorage.removeItem(T),await y("/api/governance/logout",{method:"POST"}),location.reload()}),c&&c.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,i=await y("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:d})});i.ok?(i.csrf_token&&sessionStorage.setItem(T,i.csrf_token),_()):D("loginMsg",i.error||"Access Denied")}),(async()=>{const s=await y("/api/governance/me");s&&s.ok&&_()})()});const C=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",k="gov_csrf_token";function G(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function U(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function g(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Y(t){return g(t).replace(/"/g,"&quot;")}async function f(t,e={}){var n;const o=C+t,a={...e.headers||{}},r=sessionStorage.getItem(k),c=String(e.method||"GET").toUpperCase();r&&!["GET","HEAD","OPTIONS"].includes(c)&&(a["X-CSRF-Token"]=r);const s={credentials:"include",...e,headers:a},d=await fetch(o,s);if(d.status===401||d.status===403){sessionStorage.removeItem(k);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(n=d.headers.get("content-type"))!=null&&n.includes("application/json")?await d.json():d}function S(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),J(),$(),L("Overview")}function L(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),X()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),W()}}async function J(){const t=await f("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(k,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function $(){const t=document.getElementById("insightsArea");if(!t)return;const e=await f("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],a=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const r=a.overall_score_avg!=null?Math.round(a.overall_score_avg):0,c=a.latest_at?new Date(a.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${r>=75?"var(--accent-color)":r>=45?"#fbbf24":"#ff0055"}">${r}</div>
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
    `;o.forEach(function(d){const i=d.report,m=g(d.env_name||d.environment_id||"—"),h=((i==null?void 0:i.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${h}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${g((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(s+='<div class="domain-grid">',(d.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${g(v.domain_name)}</span>
                            <span class="domain-score ${b}">${g(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function X(){const t=document.getElementById("envsArea");if(t)try{const e=await f("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${g(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${g(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${Y(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>F(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function F(t){const e=await f("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(C+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function W(){const t=document.getElementById("auditArea");if(!t)return;const e=await f("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${g(n.action)}</span> 
                <span>${g(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),a=document.getElementById("btnRefresh"),r=document.getElementById("btnLogout"),c=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>L("Overview")),e&&e.addEventListener("click",()=>L("Compliance")),n&&n.addEventListener("click",()=>L("Environments")),o&&o.addEventListener("click",()=>L("Audit")),a&&a.addEventListener("click",()=>{$(),U("Synchronizing with Governance Cluster...")}),r&&r.addEventListener("click",async()=>{sessionStorage.removeItem(k),await f("/api/governance/logout",{method:"POST"}),location.reload()}),c&&c.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,i=await f("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:d})});i.ok?(i.csrf_token&&sessionStorage.setItem(k,i.csrf_token),S()):G("loginMsg",i.error||"Access Denied")}),(async()=>{const s=await f("/api/governance/me");s&&s.ok&&S()})()});const M=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",B="gov_csrf_token";function K(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function Q(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function p(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function V(t){return p(t).replace(/"/g,"&quot;")}async function E(t,e={}){var n;const o=M+t,a={...e.headers||{}},r=sessionStorage.getItem(B),c=String(e.method||"GET").toUpperCase();r&&!["GET","HEAD","OPTIONS"].includes(c)&&(a["X-CSRF-Token"]=r);const s={credentials:"include",...e,headers:a},d=await fetch(o,s);if(d.status===401||d.status===403){sessionStorage.removeItem(B);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(n=d.headers.get("content-type"))!=null&&n.includes("application/json")?await d.json():d}function x(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),Z(),N(),w("Overview")}function w(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),ee()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),ne()}}async function Z(){const t=await E("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(B,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function N(){const t=document.getElementById("insightsArea");if(!t)return;const e=await E("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],a=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const r=a.overall_score_avg!=null?Math.round(a.overall_score_avg):0,c=a.latest_at?new Date(a.latest_at).toLocaleString():"—";let s=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${r>=75?"var(--accent-color)":r>=45?"#fbbf24":"#ff0055"}">${r}</div>
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
    `;o.forEach(function(d){const i=d.report,m=p(d.env_name||d.environment_id||"—"),h=((i==null?void 0:i.risk_level)||"D").toLowerCase();s+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${h}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${p((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(s+='<div class="domain-grid">',(d.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";s+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${p(v.domain_name)}</span>
                            <span class="domain-score ${b}">${p(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),s+="</div>"):s+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',s+="</div>"}),t.innerHTML=s}async function ee(){const t=document.getElementById("envsArea");if(t)try{const e=await E("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${p(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${p(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${V(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>te(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function te(t){const e=await E("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(M+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function ne(){const t=document.getElementById("auditArea");if(!t)return;const e=await E("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${p(n.action)}</span> 
                <span>${p(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),a=document.getElementById("btnRefresh"),r=document.getElementById("btnLogout"),c=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>w("Overview")),e&&e.addEventListener("click",()=>w("Compliance")),n&&n.addEventListener("click",()=>w("Environments")),o&&o.addEventListener("click",()=>w("Audit")),a&&a.addEventListener("click",()=>{N(),Q("Synchronizing with Governance Cluster...")}),r&&r.addEventListener("click",async()=>{sessionStorage.removeItem(B),await E("/api/governance/logout",{method:"POST"}),location.reload()}),c&&c.addEventListener("click",async()=>{const s=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,i=await E("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,password:d})});i.ok?(i.csrf_token&&sessionStorage.setItem(B,i.csrf_token),x()):K("loginMsg",i.error||"Access Denied")}),(async()=>{const s=await E("/api/governance/me");s&&s.ok&&x()})()});
