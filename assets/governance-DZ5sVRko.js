import"./modulepreload-polyfill-B5Qt9EMX-ulV_1b7r.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function e(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=e(o);fetch(o.href,s)}})();(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function e(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=e(o);fetch(o.href,s)}})();const O=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",T="gov_csrf_token";function N(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function R(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function u(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function j(t){return u(t).replace(/"/g,"&quot;")}async function y(t,e={}){var n;const o=O+t,s={...e.headers||{}},d=sessionStorage.getItem(T),r=String(e.method||"GET").toUpperCase();d&&!["GET","HEAD","OPTIONS"].includes(r)&&(s["X-CSRF-Token"]=d);const a={credentials:"include",...e,headers:s},c=await fetch(o,a);if(c.status===401||c.status===403){sessionStorage.removeItem(T);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(n=c.headers.get("content-type"))!=null&&n.includes("application/json")?await c.json():c}function B(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),P(),A(),I("Overview")}function I(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),H()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),q()}}async function P(){const t=await y("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(T,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function A(){const t=document.getElementById("insightsArea");if(!t)return;const e=await y("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],s=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const d=s.overall_score_avg!=null?Math.round(s.overall_score_avg):0,r=s.latest_at?new Date(s.latest_at).toLocaleString():"—";let a=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${d>=75?"var(--accent-color)":d>=45?"#fbbf24":"#ff0055"}">${d}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${r}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${s.environment_count||o.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;o.forEach(function(c){const i=c.report,m=u(c.env_name||c.environment_id||"—"),E=((i==null?void 0:i.risk_level)||"D").toLowerCase();a+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${E}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${u((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(a+='<div class="domain-grid">',(c.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";a+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${u(v.domain_name)}</span>
                            <span class="domain-score ${b}">${u(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),a+="</div>"):a+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',a+="</div>"}),t.innerHTML=a}async function H(){const t=document.getElementById("envsArea");if(t)try{const e=await y("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${u(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${u(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${j(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>z(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function z(t){const e=await y("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(O+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function q(){const t=document.getElementById("auditArea");if(!t)return;const e=await y("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${u(n.action)}</span> 
                <span>${u(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),s=document.getElementById("btnRefresh"),d=document.getElementById("btnLogout"),r=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>I("Overview")),e&&e.addEventListener("click",()=>I("Compliance")),n&&n.addEventListener("click",()=>I("Environments")),o&&o.addEventListener("click",()=>I("Audit")),s&&s.addEventListener("click",()=>{A(),R("Synchronizing with Governance Cluster...")}),d&&d.addEventListener("click",async()=>{sessionStorage.removeItem(T),await y("/api/governance/logout",{method:"POST"}),location.reload()}),r&&r.addEventListener("click",async()=>{const a=document.getElementById("loginEmail").value,c=document.getElementById("loginPassword").value,i=await y("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:c})});i.ok?(i.csrf_token&&sessionStorage.setItem(T,i.csrf_token),B()):N("loginMsg",i.error||"Access Denied")}),(async()=>{const a=await y("/api/governance/me");a&&a.ok&&B()})()});const C=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",_="gov_csrf_token";function G(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function U(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function g(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Y(t){return g(t).replace(/"/g,"&quot;")}async function f(t,e={}){var n;const o=C+t,s={...e.headers||{}},d=sessionStorage.getItem(_),r=String(e.method||"GET").toUpperCase();d&&!["GET","HEAD","OPTIONS"].includes(r)&&(s["X-CSRF-Token"]=d);const a={credentials:"include",...e,headers:s},c=await fetch(o,a);if(c.status===401||c.status===403){sessionStorage.removeItem(_);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(n=c.headers.get("content-type"))!=null&&n.includes("application/json")?await c.json():c}function S(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),J(),$(),L("Overview")}function L(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),X()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),K()}}async function J(){const t=await f("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(_,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function $(){const t=document.getElementById("insightsArea");if(!t)return;const e=await f("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],s=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const d=s.overall_score_avg!=null?Math.round(s.overall_score_avg):0,r=s.latest_at?new Date(s.latest_at).toLocaleString():"—";let a=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${d>=75?"var(--accent-color)":d>=45?"#fbbf24":"#ff0055"}">${d}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${r}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${s.environment_count||o.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;o.forEach(function(c){const i=c.report,m=g(c.env_name||c.environment_id||"—"),E=((i==null?void 0:i.risk_level)||"D").toLowerCase();a+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${E}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${g((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(a+='<div class="domain-grid">',(c.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";a+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${g(v.domain_name)}</span>
                            <span class="domain-score ${b}">${g(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),a+="</div>"):a+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',a+="</div>"}),t.innerHTML=a}async function X(){const t=document.getElementById("envsArea");if(t)try{const e=await f("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${g(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${g(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${Y(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>F(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function F(t){const e=await f("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(C+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function K(){const t=document.getElementById("auditArea");if(!t)return;const e=await f("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${g(n.action)}</span> 
                <span>${g(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),s=document.getElementById("btnRefresh"),d=document.getElementById("btnLogout"),r=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>L("Overview")),e&&e.addEventListener("click",()=>L("Compliance")),n&&n.addEventListener("click",()=>L("Environments")),o&&o.addEventListener("click",()=>L("Audit")),s&&s.addEventListener("click",()=>{$(),U("Synchronizing with Governance Cluster...")}),d&&d.addEventListener("click",async()=>{sessionStorage.removeItem(_),await f("/api/governance/logout",{method:"POST"}),location.reload()}),r&&r.addEventListener("click",async()=>{const a=document.getElementById("loginEmail").value,c=document.getElementById("loginPassword").value,i=await f("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:c})});i.ok?(i.csrf_token&&sessionStorage.setItem(_,i.csrf_token),S()):G("loginMsg",i.error||"Access Denied")}),(async()=>{const a=await f("/api/governance/me");a&&a.ok&&S()})()});const M=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",k="gov_csrf_token";function W(t,e,n){const o=document.getElementById(t);o&&(o.className="msg err",o.textContent=e,o.classList.remove("hidden"))}function V(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function p(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Q(t){return p(t).replace(/"/g,"&quot;")}async function h(t,e={}){var c;const n=M+t,o={...e.headers||{}},s=sessionStorage.getItem(k),d=String(e.method||"GET").toUpperCase();s&&!["GET","HEAD","OPTIONS"].includes(d)&&(o["X-CSRF-Token"]=s);const r={credentials:"include",...e,headers:o},a=await fetch(n,r);if(a.status===401||a.status===403){sessionStorage.removeItem(k);const i=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");i&&(i.style.display="flex"),m&&m.classList.add("hidden");return}return(c=a.headers.get("content-type"))!=null&&c.includes("application/json")?await a.json():a}function x(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),Z(),D(),w("Overview")}function w(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),ee()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),ne()}}async function Z(){const t=await h("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(k,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function D(){const t=document.getElementById("insightsArea");if(!t)return;const e=await h("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,o=n.environments||[],s=n.summary||{};if(o.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const d=s.overall_score_avg!=null?Math.round(s.overall_score_avg):0,r=s.latest_at?new Date(s.latest_at).toLocaleString():"—";let a=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${d>=75?"var(--accent-color)":d>=45?"#fbbf24":"#ff0055"}">${d}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${r}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${s.environment_count||o.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;o.forEach(function(c){const i=c.report,m=p(c.env_name||c.environment_id||"—"),E=((i==null?void 0:i.risk_level)||"D").toLowerCase();a+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${E}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${p((i==null?void 0:i.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,i?(a+='<div class="domain-grid">',(c.domains||[]).forEach(function(v){const l=v.score!=null?Math.round(v.score):0,b=l>=90?"lvl-a":l>=75?"lvl-b":l>=60?"lvl-c":"lvl-d";a+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${p(v.domain_name)}</span>
                            <span class="domain-score ${b}">${p(l)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${l}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),a+="</div>"):a+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',a+="</div>"}),t.innerHTML=a}async function ee(){const t=document.getElementById("envsArea");if(t)try{const e=await h("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${p(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${p(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${Q(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>te(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function te(t){const e=await h("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(M+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function ne(){const t=document.getElementById("auditArea");if(!t)return;const e=await h("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${p(n.action)}</span> 
                <span>${p(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),o=document.getElementById("dashTabAudit"),s=document.getElementById("btnRefresh"),d=document.getElementById("btnLogout"),r=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>w("Overview")),e&&e.addEventListener("click",()=>w("Compliance")),n&&n.addEventListener("click",()=>w("Environments")),o&&o.addEventListener("click",()=>w("Audit")),s&&s.addEventListener("click",()=>{D(),V("Synchronizing with Governance Cluster...")}),d&&d.addEventListener("click",async()=>{sessionStorage.removeItem(k),await h("/api/governance/logout",{method:"POST"}),location.reload()}),r&&r.addEventListener("click",async()=>{const a=document.getElementById("loginEmail").value,c=document.getElementById("loginPassword").value,i=await h("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:c})});i.ok?(i.csrf_token&&sessionStorage.setItem(k,i.csrf_token),x()):W("loginMsg",i.error||"Access Denied")}),(async()=>{const a=await h("/api/governance/me");a&&a.ok&&x()})()});
