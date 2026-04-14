const API_BASE = "https://9sec-smtp-backend.nine-security.workers.dev"; // Replace if needed

function escapeHtml(value) {
    if (value == null) return '';
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
}

async function login() {
    const token = document.getElementById("authTokenInput").value.trim();
    if (!token) return alert("Please enter a token");

    // Verify if token is valid via simple API call (or just store and try)
    sessionStorage.setItem("dmarc_token", token);
    document.getElementById("loginScreen").style.display = "none";
    const userBadge = document.getElementById("userBadge");
    if (userBadge) userBadge.innerText = "Authorized User";
    loadDashboard(token);
}

// Auto-login check
const storedToken = sessionStorage.getItem("dmarc_token");
if (storedToken) {
    const input = document.getElementById("authTokenInput");
    if (input) input.value = storedToken;
}

async function loadDashboard(token) {
    try {
        const res = await fetch(`${API_BASE}/api/dmarc/reports`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 401) {
            sessionStorage.removeItem("dmarc_token");
            alert("Unauthorized: Invalid Token");
            location.reload();
            return;
        }

        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to fetch data");

        const reports = json.data;
        renderStats(reports);
        renderTable(reports);
        if (reports.length > 0) renderCharts(reports);

    } catch (e) {
        console.error(e);
        alert("Error loading data: " + e.message);
    }
}

function renderStats(reports) {
    const el = document.getElementById("totalEmails");
    if (el) el.innerText = reports.length + " Reports";
}

function renderTable(reports) {
    const tbody = document.querySelector("#reportsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = reports.map(r => `
        <tr>
            <td>${escapeHtml(new Date(r.date_range_end * 1000).toLocaleDateString())}</td>
            <td>${escapeHtml(r.org_name || '')}</td>
            <td>-</td>
            <td>-</td>
            <td><span class="badge ${r.policy_p === 'reject' ? 'pass' : 'warning'}">${escapeHtml(r.policy_p || '')}</span></td>
            <td><button class="js-view-report" data-report-id="${escapeAttr(r.id)}" style="padding:4px 8px; width:auto; font-size:0.8rem;">View</button></td>
        </tr>
    `).join("");
    tbody.querySelectorAll('.js-view-report').forEach((button) => {
        button.addEventListener('click', () => viewReport(button.dataset.reportId));
    });
}

let currentVolumeChart = null;
let currentSourceChart = null;

async function viewReport(id) {
    try {
        const volumeChartEl = document.getElementById("volumeChart");
        if (volumeChartEl) {
            volumeChartEl.parentElement.innerHTML = '<canvas id="volumeChart"></canvas><div style="position:absolute;top:45%;left:45%;color:#888;">Loading...</div>';
        }

        const token = sessionStorage.getItem("dmarc_token");
        const res = await fetch(`${API_BASE}/api/dmarc/report/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load report");
        const json = await res.json();
        const data = json.data;

        const totalEmailsEl = document.getElementById("totalEmails");
        const authRateEl = document.getElementById("authRate");
        const threatCountEl = document.getElementById("threatCount");

        if (totalEmailsEl) totalEmailsEl.innerText = data.meta.total_messages.toLocaleString();
        if (authRateEl) authRateEl.innerText = data.stats.pass_rate + "%";
        if (threatCountEl) threatCountEl.innerText = data.stats.auth_failed.toLocaleString();

        renderVolumeChart(data.stats);
        renderSourceChart(data.sources);

        document.querySelectorAll("tr").forEach(r => r.style.background = "");

    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
}

function renderVolumeChart(stats) {
    const canvas = document.getElementById("volumeChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (currentVolumeChart) currentVolumeChart.destroy();

    // @ts-ignore
    currentVolumeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Fully Aligned', 'Auth Failed', 'Partial'],
            datasets: [{
                data: [stats.fully_aligned, stats.auth_failed, stats.partially_aligned],
                backgroundColor: ['#00ff9d', '#ff4757', '#ffa502'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }
    });
}

function renderSourceChart(sources) {
    const canvas = document.getElementById("sourceChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const top5 = sources.slice(0, 5);
    if (currentSourceChart) currentSourceChart.destroy();

    // @ts-ignore
    currentSourceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5.map(s => s.ip),
            datasets: [{
                label: 'Volume',
                data: top5.map(s => s.count),
                backgroundColor: '#00d4ff',
                borderRadius: 4
            }, {
                label: 'Failed',
                data: top5.map(s => s.dkim_fail + s.spf_fail),
                backgroundColor: '#ff4757',
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#333' } } } }
    });
}

function renderCharts(reports) {
    console.log("Aggregate charts placeholder for", reports.length, "reports");
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) btnLogin.addEventListener('click', login);
});
