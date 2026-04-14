const API_BASE = "https://gov.nine-security.com";
const scanBtn = document.getElementById('scanBtn');
const targetInput = document.getElementById('targetDomain');
const loader = document.getElementById('loader');
const resultsArea = document.getElementById('resultsArea');
const hitsList = document.getElementById('hitsList');
const statusBar = document.getElementById('statusBar');

function escapeHtml(value) {
    if (value == null) return '';
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
}

if (scanBtn && targetInput) {
    scanBtn.addEventListener('click', async () => {
        const domain = targetInput.value.trim();
        if (!domain) return;

        // UI Reset
        scanBtn.disabled = true;
        if (loader) loader.style.display = 'block';
        if (resultsArea) resultsArea.style.display = 'none';
        if (hitsList) hitsList.innerHTML = '';
        if (statusBar) statusBar.innerText = '> Initializing Scan Protocol...';

        try {
            const response = await fetch(`${API_BASE}/api/domain/instant-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });

            const data = await response.json();
            if (loader) loader.style.display = 'none';
            scanBtn.disabled = false;

            if (!data.ok) throw new Error(data.error || "Scan failed");

            if (resultsArea) resultsArea.style.display = 'block';
            if (statusBar) statusBar.innerText = `[SUCCESS] Analysis complete. Scanned ${data.total_scanned || 0} variations. Found ${data.hits ? data.hits.length : 0} threats.`;

            if (hitsList) {
                if (!data.hits || data.hits.length === 0) {
                    hitsList.innerHTML = `
                        <div class="card" style="text-align:center; padding: 2rem; border-color: var(--accent-color);">
                            <svg class="inline-icon" style="width:2rem;height:2rem;color:var(--accent-color);margin-bottom:1rem;display:inline-block;" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v7.8z"/></svg>
                            <p style="color: var(--accent-color); font-family: var(--font-mono);">SAFE: No active threats detected for this domain.</p>
                        </div>
                    `;
                } else {
                    data.hits.forEach(hit => {
                        const card = document.createElement('div');
                        card.className = 'hit-card';
                        card.innerHTML = `
                            <div>
                                <div class="hit-domain">${escapeHtml(hit.candidate_domain || '')}</div>
                                <div class="hit-ip">RESOLVED_IP: ${escapeHtml(hit.ip || '')}</div>
                            </div>
                            <div class="hit-rule">${escapeHtml(String(hit.rule || '').toUpperCase())}</div>
                        `;
                        hitsList.appendChild(card);
                    });
                }
            }

        } catch (err) {
            if (statusBar) statusBar.innerText = `[ERROR] ${err.message}`;
            if (loader) loader.style.display = 'none';
            scanBtn.disabled = false;
            if (resultsArea) resultsArea.style.display = 'block';
        }
    });

    targetInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') scanBtn.click();
    });
}
