import"./modulepreload-polyfill-B5Qt9EMX.js";
const J=window.location.hostname==="nine-security.com"||window.location.hostname==="www.nine-security.com"||window.location.hostname==="9-Security.github.io"?"https://api.nine-security.com":"";
let B=null;
function m(e){if(e==null)return"";const t=document.createElement("div");return t.textContent=String(e),t.innerHTML}
function C(e){return m(e).replace(/"/g,"&quot;")}
function X(e,t,n){if(!e)return;const a=String(t||"").match(/^[a-z0-9-]+$/i)?t:"fa-circle-info";e.replaceChildren();const o=document.createElement("i");o.className="fa-solid "+a;if(n)o.style.color=n;e.appendChild(o)}
function Tn(){const e=document.getElementById("sidebar-toggle"),t=document.getElementById("sidebar");if(e&&t){e.onclick=()=>{t.classList.toggle("collapsed");const n=e.querySelector("i");t.classList.contains("collapsed")?n.className="fa-solid fa-chevron-right":n.className="fa-solid fa-chevron-left"}}}
function Gn(){}
function We(){const f1=document.getElementById("log-filter"), f2=document.getElementById("log-from"), f3=document.getElementById("log-to");if(f1)f1.value="";if(f2)f2.value="";if(f3)f3.value="";R(1)}
document.addEventListener("DOMContentLoaded",async()=>{await he();Tn();setInterval(()=>{if(B&&document.getElementById("overview")?.classList.contains("active")){R(1);yt()}},3e4);Ln()});
function Ln(){const navs={"nav-overview":"overview","nav-event":"event","nav-audit":"audit","nav-policy":"policy","nav-users":"users","nav-setting":"setting"};Object.entries(navs).forEach(([b,I])=>{const k=document.getElementById(b);if(k)k.addEventListener("click",Q=>de(I,Q.currentTarget))});document.getElementById("nav-logout")?.addEventListener("click",Me);document.getElementById("mode-active")?.addEventListener("click",()=>ze("Active"));document.getElementById("mode-passive")?.addEventListener("click",()=>ze("Passive"));document.getElementById("btn-show-add-block")?.addEventListener("click",ct);document.getElementById("btn-show-add-trust")?.addEventListener("click",dt);document.getElementById("btn-show-invite-user")?.addEventListener("click",lt);document.getElementById("login-form")?.addEventListener("submit",b=>{b.preventDefault();He()})}
async function he(){try{const e=await fetch(J+"/api/user/me",{credentials:"include"});const t=await e.json();if(t.ok&&t.user){B=t.user;document.getElementById("login-overlay").style.display="none";const d=document.getElementById("user-display");if(d)d.textContent=B.email;Ne("overview");return}}catch(e){}document.getElementById("login-overlay").style.display="flex"}
async function He(){const e=document.getElementById("login-email").value,t=document.getElementById("login-pass").value;try{const a=await(await fetch(J+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:e,password:t})})).json();if(a.ok)await he();else alert(a.error||"Login Failed")}catch(e){alert("Cannot connect to server")}}
async function Me(){await fetch(J+"/api/auth/logout",{method:"POST",credentials:"include"});location.reload()}
function de(e,t){document.querySelectorAll(".nav-item").forEach(a=>a.classList.remove("active"));t.classList.add("active");document.querySelectorAll(".section").forEach(a=>a.classList.remove("active"));document.getElementById(e).classList.add("active");Ne(e)}
async function Ne(e){if(!B)return;if(e==="overview")R(1);if(e==="policy"){ke();ft();pt()}}
async function f(e,t="GET",n=null){const a={method:t,headers:{},credentials:"include"};if(n){a.headers["Content-Type"]="application/json";a.body=JSON.stringify(n)}return await(await fetch(J+e,a)).json()}
async function R(e=1){const res=await f("/api/user/dns-analytics?page="+e);if(res.ok){if(res.stats){const s=res.stats;if(document.getElementById("stat-total"))document.getElementById("stat-total").textContent=s.total_queries||0;if(document.getElementById("stat-clients"))document.getElementById("stat-clients").textContent=s.unique_clients||0}xe(res.logs)}}
function xe(logs){const a=document.getElementById("log-table-body");if(!a)return;a.innerHTML=logs.map(i=>"<tr><td>"+m(new Date(i.timestamp).toLocaleString())+"</td><td>"+m(i.query_domain)+"</td><td><span class='badge'>"+m(i.risk_score)+"</span></td></tr>").join("")}
async function pt(){const e=await f("/api/user/dns-ips");if(e.ok&&e.data.length>0){const t=e.data[0];const r=document.getElementById("resolver-ip");if(r)r.textContent=t.public_ip||"0.0.0.0"}}
async function ze(e){const a=await f("/api/user/dns-settings","PATCH",{helix_dns_mode:e});if(a.ok)alert("Mode switched to "+e);pt()}
function ct(){const m=document.getElementById("blocklist-modal");if(m)m.style.display="flex"}
function Rn(){const m=document.getElementById("blocklist-modal");if(m)m.style.display="none"}
function dt(){const m=document.getElementById("allowlist-modal");if(m)m.style.display="flex"}
function rt(){const m=document.getElementById("allowlist-modal");if(m)m.style.display="none"}
function lt(){const m=document.getElementById("user-modal");if(m)m.style.display="flex"}
function st(){const m=document.getElementById("user-modal");if(m)m.style.display="none"}
function ke(){}
function ft(){}
function yt(){}
window.logout=Me;window.login=He;window.closeAlert=()=>document.getElementById("alert-modal").style.display="none";window.showAddBlocklist=ct;window.hideAddBlocklist=Rn;window.showAddAllowlist=dt;window.hideAddAllowlist=rt;window.showAddUser=lt;window.hideAddUser=st;window.switchSection=de;window.Gn=Gn;window.resetEventFilters=We;
