import"./modulepreload-polyfill-B5Qt9EMX-ulV_1b7r.js";const _=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",E="gov_csrf_token";function x(t,e,n){const s=document.getElementById(t);s&&(s.className="msg err",s.textContent=e,s.classList.remove("hidden"))}function A(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function v(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function O(t){return v(t).replace(/"/g,"&quot;")}async function u(t,e={}){var n;const s=_+t,i={...e.headers||{}},c=sessionStorage.getItem(E),l=String(e.method||"GET").toUpperCase();c&&!["GET","HEAD","OPTIONS"].includes(l)&&(i["X-CSRF-Token"]=c);const a={credentials:"include",...e,headers:i},d=await fetch(s,a);if(d.status===401||d.status===403){sessionStorage.removeItem(E);const o=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");o&&(o.style.display="flex"),m&&m.classList.add("hidden");return}return(n=d.headers.get("content-type"))!=null&&n.includes("application/json")?await d.json():d}function w(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),C(),B(),f("Overview")}function f(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),$()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),M()}}async function C(){const t=await u("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(E,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function B(){const t=document.getElementById("insightsArea");if(!t)return;const e=await u("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,s=n.environments||[],i=n.summary||{};if(s.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const c=i.overall_score_avg!=null?Math.round(i.overall_score_avg):0,l=i.latest_at?new Date(i.latest_at).toLocaleString():"—";let a=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${c>=75?"var(--accent-color)":c>=45?"#fbbf24":"#ff0055"}">${c}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${l}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${i.environment_count||s.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;s.forEach(function(d){const o=d.report,m=v(d.env_name||d.environment_id||"—"),I=((o==null?void 0:o.risk_level)||"D").toLowerCase();a+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${I}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${v((o==null?void 0:o.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,o?(a+='<div class="domain-grid">',(d.domains||[]).forEach(function(y){const r=y.score!=null?Math.round(y.score):0,L=r>=90?"lvl-a":r>=75?"lvl-b":r>=60?"lvl-c":"lvl-d";a+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${v(y.domain_name)}</span>
                            <span class="domain-score ${L}">${v(r)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${r}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),a+="</div>"):a+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',a+="</div>"}),t.innerHTML=a}async function $(){const t=document.getElementById("envsArea");if(t)try{const e=await u("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${v(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${v(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${O(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>D(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function D(t){const e=await u("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(_+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function M(){const t=document.getElementById("auditArea");if(!t)return;const e=await u("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${v(n.action)}</span> 
                <span>${v(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),s=document.getElementById("dashTabAudit"),i=document.getElementById("btnRefresh"),c=document.getElementById("btnLogout"),l=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>f("Overview")),e&&e.addEventListener("click",()=>f("Compliance")),n&&n.addEventListener("click",()=>f("Environments")),s&&s.addEventListener("click",()=>f("Audit")),i&&i.addEventListener("click",()=>{B(),A("Synchronizing with Governance Cluster...")}),c&&c.addEventListener("click",async()=>{sessionStorage.removeItem(E),await u("/api/governance/logout",{method:"POST"}),location.reload()}),l&&l.addEventListener("click",async()=>{const a=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,o=await u("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:d})});o.ok?(o.csrf_token&&sessionStorage.setItem(E,o.csrf_token),w()):x("loginMsg",o.error||"Access Denied")}),(async()=>{const a=await u("/api/governance/me");a&&a.ok&&w()})()});const S=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"":"https://api.nine-security.com",b="gov_csrf_token";function R(t,e,n){const s=document.getElementById(t);s&&(s.className="msg err",s.textContent=e,s.classList.remove("hidden"))}function j(t){const e=document.getElementById("toast");e&&(e.textContent=t,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show")},4e3))}function g(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function N(t){return g(t).replace(/"/g,"&quot;")}async function p(t,e={}){var d;const n=S+t,s={...e.headers||{}},i=sessionStorage.getItem(b),c=String(e.method||"GET").toUpperCase();i&&!["GET","HEAD","OPTIONS"].includes(c)&&(s["X-CSRF-Token"]=i);const l={credentials:"include",...e,headers:s},a=await fetch(n,l);if(a.status===401||a.status===403){sessionStorage.removeItem(b);const o=document.getElementById("gov-login-overlay"),m=document.getElementById("gov-authenticated-shell");o&&(o.style.display="flex"),m&&m.classList.add("hidden");return}return(d=a.headers.get("content-type"))!=null&&d.includes("application/json")?await a.json():a}function T(){const t=document.getElementById("gov-login-overlay"),e=document.getElementById("gov-authenticated-shell");t&&(t.style.display="none"),e&&e.classList.remove("hidden");const n=document.getElementById("dashboard");n&&n.classList.remove("hidden"),H(),k(),h("Overview")}function h(t){if(document.querySelectorAll(".gov-tabs button").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".dashboard-panel").forEach(e=>e.classList.add("hidden")),t==="Overview"){const e=document.getElementById("dashTabOverview"),n=document.getElementById("panelOverview");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Compliance"){const e=document.getElementById("dashTabCompliance"),n=document.getElementById("panelCompliance");e&&e.classList.add("active"),n&&n.classList.remove("hidden")}else if(t==="Environments"){const e=document.getElementById("dashTabEnvs"),n=document.getElementById("panelEnvs");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),z()}else if(t==="Audit"){const e=document.getElementById("dashTabAudit"),n=document.getElementById("panelAudit");e&&e.classList.add("active"),n&&n.classList.remove("hidden"),q()}}async function H(){const t=await p("/api/governance/me");if(t&&t.ok&&t.user){t.csrf_token&&sessionStorage.setItem(b,t.csrf_token);const e=document.getElementById("userInfo");e&&(e.textContent=t.user.email)}}async function k(){const t=document.getElementById("insightsArea");if(!t)return;const e=await p("/api/governance/insights");if(!e||!e.ok){t.innerHTML='<div class="card" style="text-align:center; padding: 3rem;"><p color="var(--text-secondary)">[ERROR] Error synchronizing telemetry.</p></div>';return}const n=e.data,s=n.environments||[],i=n.summary||{};if(s.length===0){t.innerHTML='<div class="card" style="text-align:center; padding: 4rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[EMPTY] Ready for Assessment. Register an environment to begin.</p></div>';return}const c=i.overall_score_avg!=null?Math.round(i.overall_score_avg):0,l=i.latest_at?new Date(i.latest_at).toLocaleString():"—";let a=`
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: ${c>=75?"var(--accent-color)":c>=45?"#fbbf24":"#ff0055"}">${c}</div>
                <div class="stat-label">MATURITY_INDEX (ETMI)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="font-size: 1.2rem; margin: 15px 0;">${l}</div>
                <div class="stat-label">LAST_THREAT_INTEL_SYNC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${i.environment_count||s.length}</div>
                <div class="stat-label">MONITORED_ASSETS</div>
            </div>
        </div>
    `;s.forEach(function(d){const o=d.report,m=g(d.env_name||d.environment_id||"—"),I=((o==null?void 0:o.risk_level)||"D").toLowerCase();a+=`
            <div class="env-group" style="margin-top: 4rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <h3 style="margin:0; font-size: 1.2rem; display: flex; align-items: center; gap: 14px; font-family:var(--font-mono);">
                        <i class="fa-solid fa-server" style="color:var(--accent-color)"></i>
                        ${m}
                        <span class="score-badge lvl-${I}" style="font-size: 0.7rem; border: 1px solid currentColor; padding: 2px 8px;">${g((o==null?void 0:o.risk_level)||"D")}</span>
                    </h3>
                </div>
        `,o?(a+='<div class="domain-grid">',(d.domains||[]).forEach(function(y){const r=y.score!=null?Math.round(y.score):0,L=r>=90?"lvl-a":r>=75?"lvl-b":r>=60?"lvl-c":"lvl-d";a+=`
                    <div class="domain-card">
                        <div class="domain-header">
                            <span class="domain-name">${g(y.domain_name)}</span>
                            <span class="domain-score ${L}">${g(r)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${r}%; background: var(--fill)"></div>
                        </div>
                    </div>
                `}),a+="</div>"):a+='<div class="card" style="text-align: center; padding: 3rem;"><p style="color:var(--text-secondary); font-family:var(--font-mono);">[PENDING] Awaiting collector payload...</p></div>',a+="</div>"}),t.innerHTML=a}async function z(){const t=document.getElementById("envsArea");if(t)try{const e=await p("/api/governance/environments");e.ok&&(t.innerHTML=e.data.map(n=>`
                <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-family:var(--font-mono); font-weight:600;">${g(n.name||n.id)}</div>
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">UID: ${g(n.id)}</div>
                    </div>
                    <button class="btn secondary-btn js-run-download" data-env-id="${N(n.id)}" style="padding: 5px 12px; font-size:0.7rem;">DOWNLOAD_COLLECTOR</button>
                </div>
            `).join(""),t.querySelectorAll(".js-run-download").forEach(n=>{n.addEventListener("click",()=>P(n.dataset.envId))}))}catch{t.innerHTML="Sync Error."}}async function P(t){const e=await p("/api/governance/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({environment_id:t})});e.ok&&window.open(S+"/api/governance/download/"+e.data.upload_session_id+"?token="+encodeURIComponent(e.data.token),"_blank")}async function q(){const t=document.getElementById("auditArea");if(!t)return;const e=await p("/api/governance/audit");e&&e.ok&&(t.innerHTML=e.data.map(n=>`
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
                <span style="color:var(--text-secondary)">[${new Date(n.timestamp).toLocaleString()}]</span> 
                <span style="color:var(--accent-color)">${g(n.action)}</span> 
                <span>${g(n.details||"")}</span>
            </div>
        `).join("")||"No audit logs found.")}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("dashTabOverview"),e=document.getElementById("dashTabCompliance"),n=document.getElementById("dashTabEnvs"),s=document.getElementById("dashTabAudit"),i=document.getElementById("btnRefresh"),c=document.getElementById("btnLogout"),l=document.getElementById("btnLogin");t&&t.addEventListener("click",()=>h("Overview")),e&&e.addEventListener("click",()=>h("Compliance")),n&&n.addEventListener("click",()=>h("Environments")),s&&s.addEventListener("click",()=>h("Audit")),i&&i.addEventListener("click",()=>{k(),j("Synchronizing with Governance Cluster...")}),c&&c.addEventListener("click",async()=>{sessionStorage.removeItem(b),await p("/api/governance/logout",{method:"POST"}),location.reload()}),l&&l.addEventListener("click",async()=>{const a=document.getElementById("loginEmail").value,d=document.getElementById("loginPassword").value,o=await p("/api/governance/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:d})});o.ok?(o.csrf_token&&sessionStorage.setItem(b,o.csrf_token),T()):R("loginMsg",o.error||"Access Denied")}),(async()=>{const a=await p("/api/governance/me");a&&a.ok&&T()})()});
