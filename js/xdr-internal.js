const loginOverlay = document.getElementById('login-overlay');
const xdrShell = document.getElementById('xdr-shell');
const loginError = document.getElementById('login-error');
const sessionUser = document.getElementById('session-user');
const endpointRows = document.getElementById('endpoint-rows');
const eventRows = document.getElementById('event-rows');
const summary = document.getElementById('summary');
const tenantFilter = document.getElementById('tenant-filter');
const groupFilter = document.getElementById('group-filter');
const installerTokenKey = document.getElementById('installer-tokenkey');
const installerCloudHost = document.getElementById('installer-cloudhost');
const installerCloudPort = document.getElementById('installer-cloudport');
const installerGroup = document.getElementById('installer-group');
const installerStatus = document.getElementById('installer-status');
const installerCommand = document.getElementById('installer-command');
const btnDownloadMsi = document.getElementById('btn-download-msi');
const btnDownloadLauncher = document.getElementById('btn-download-launcher');

let installerMeta = { available: false, filename: 'NineSecurityAxEDR.msi', suggestedCloudHost: '', suggestedCloudPort: '443', downloadPath: '/api/agent/internal/download-msi' };

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function api(path, init = {}) {
    const response = await fetch(path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
        ...init
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || `${response.status} ${response.statusText}`);
    }
    return payload;
}

function currentInstallCommand() {
    const msiName = installerMeta.filename || 'NineSecurityAxEDR.msi';
    const tokenKey = (installerTokenKey.value || '').trim();
    const cloudHost = (installerCloudHost.value || '').trim();
    const cloudPort = (installerCloudPort.value || '').trim();
    const group = (installerGroup.value || '').trim();
    const args = [];

    if (tokenKey) args.push(`TOKENKEY="${tokenKey.replace(/"/g, '""')}"`);
    if (cloudHost) args.push(`CLOUDADDR="${cloudHost.replace(/"/g, '""')}"`);
    if (cloudPort) args.push(`CLOUDPORT="${cloudPort.replace(/"/g, '""')}"`);
    if (group) args.push(`GROUP="${group.replace(/"/g, '""')}"`);

    return `msiexec /i "${msiName}" ${args.join(' ')}`.trim();
}

function renderInstallerCommand() {
    const command = currentInstallCommand();
    installerCommand.textContent = command;
}

function downloadBlob(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

async function loadInstallerMeta() {
    const meta = await api('/api/agent/internal/installer-meta');
    installerMeta = {
        available: !!meta.available,
        filename: meta.filename || 'NineSecurityAxEDR.msi',
        suggestedCloudHost: meta.suggestedCloudHost || '',
        suggestedCloudPort: meta.suggestedCloudPort || '443',
        downloadPath: meta.downloadPath || '/api/agent/internal/download-msi'
    };

    if (!installerCloudHost.value) installerCloudHost.value = installerMeta.suggestedCloudHost;
    if (!installerCloudPort.value) installerCloudPort.value = installerMeta.suggestedCloudPort;

    btnDownloadMsi.disabled = !installerMeta.available;
    btnDownloadLauncher.disabled = !installerMeta.available;
    installerStatus.textContent = installerMeta.available
        ? `MSI ready: ${installerMeta.filename}`
        : 'MSI unavailable on this server. Set XDR_AGENT_MSI_PATH to enable download.';
    renderInstallerCommand();
}

function renderEndpoints(items) {
    if (!items.length) {
        endpointRows.innerHTML = `<tr><td colspan="7" class="muted" style="padding:20px;text-align:center;">No endpoint data yet</td></tr>`;
        return;
    }
    endpointRows.innerHTML = items.map((row) => {
        const statusClass = row.online ? 'status-online' : 'status-offline';
        const statusText = row.online ? 'ONLINE' : 'OFFLINE';
        return `<tr>
            <td>${esc(row.endpoint_id)}</td>
            <td>${esc(row.tenant_id)}</td>
            <td>${esc(row.endpoint_group || '-')}</td>
            <td>${esc(row.hostname || '-')}</td>
            <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            <td>${esc(row.last_heartbeat_at || '-')}</td>
            <td>${esc(row.last_event_at || '-')}</td>
        </tr>`;
    }).join('');
}

function renderEvents(items) {
    if (!items.length) {
        eventRows.innerHTML = `<tr><td colspan="5" class="muted" style="padding:20px;text-align:center;">No recent events</td></tr>`;
        return;
    }
    eventRows.innerHTML = items.map((row) => {
        const compact = JSON.stringify(row.event || {}).slice(0, 220);
        return `<tr>
            <td>${esc(row.receivedAt || '-')}</td>
            <td>${esc(row.tenantId)}</td>
            <td>${esc(row.group || '-')}</td>
            <td>${esc(row.endpointId)}</td>
            <td><code>${esc(compact)}</code></td>
        </tr>`;
    }).join('');
}

async function loadMeta() {
    const meta = await api('/api/agent/internal/meta');
    const tenantGroups = meta.tenants || [];
    const tenantSet = Array.from(new Set(tenantGroups.map((t) => t.tenant_id))).sort();
    const groupSet = Array.from(new Set(tenantGroups.map((t) => t.endpoint_group).filter(Boolean))).sort();

    tenantFilter.innerHTML = `<option value="">ALL_TENANTS</option>` +
        tenantSet.map((tenant) => `<option value="${esc(tenant)}">${esc(tenant)}</option>`).join('');
    groupFilter.innerHTML = `<option value="">ALL_GROUPS</option>` +
        groupSet.map((group) => `<option value="${esc(group)}">${esc(group)}</option>`).join('');
}

async function refresh() {
    const tenantId = tenantFilter.value || '';
    const group = groupFilter.value || '';
    const query = new URLSearchParams();
    if (tenantId) query.set('tenantId', tenantId);
    if (group) query.set('group', group);
    const q = query.toString() ? `?${query.toString()}` : '';

    const [endpointsResp, eventsResp] = await Promise.all([
        api(`/api/agent/internal/endpoints${q}`),
        api(`/api/agent/internal/events${q}${q ? '&' : '?'}limit=120`)
    ]);

    const endpoints = endpointsResp.endpoints || [];
    const events = eventsResp.events || [];
    renderEndpoints(endpoints);
    renderEvents(events);
    summary.textContent = `Endpoints: ${endpoints.length} | Events: ${events.length}`;
}

async function checkSession() {
    try {
        const me = await api('/api/user/me');
        sessionUser.textContent = `Operator: ${me.user?.email || me.user?.id || 'unknown'}`;
        loginOverlay.classList.add('hidden');
        xdrShell.classList.remove('hidden');
        await loadInstallerMeta();
        await loadMeta();
        await refresh();
        return true;
    } catch {
        loginOverlay.classList.remove('hidden');
        xdrShell.classList.add('hidden');
        return false;
    }
}

document.getElementById('btn-login').addEventListener('click', async () => {
    loginError.textContent = '';
    try {
        await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            })
        });
        await checkSession();
    } catch (error) {
        loginError.textContent = error.message || 'Login failed';
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    loginOverlay.classList.remove('hidden');
    xdrShell.classList.add('hidden');
});

document.getElementById('btn-refresh').addEventListener('click', refresh);
document.getElementById('btn-apply').addEventListener('click', refresh);
btnDownloadMsi.addEventListener('click', () => {
    if (!installerMeta.available) {
        installerStatus.textContent = 'MSI unavailable on this server.';
        return;
    }
    window.location.href = installerMeta.downloadPath;
});
btnDownloadLauncher.addEventListener('click', () => {
    if (!installerMeta.available) {
        installerStatus.textContent = 'MSI unavailable on this server.';
        return;
    }
    const msiName = installerMeta.filename || 'NineSecurityAxEDR.msi';
    const script = [
        '@echo off',
        'setlocal',
        `set MSI_NAME=${msiName}`,
        currentInstallCommand(),
        'endlocal',
        ''
    ].join('\r\n');
    downloadBlob('install-axedr.cmd', script, 'application/octet-stream');
});
[installerTokenKey, installerCloudHost, installerCloudPort, installerGroup].forEach((el) => {
    el.addEventListener('input', renderInstallerCommand);
});

checkSession();
