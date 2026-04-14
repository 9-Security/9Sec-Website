// Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading-indicator');
const results = document.getElementById('results');

if (dropZone && fileInput) {
    // Drag & Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', (e) => {
        if (e.target && e.target instanceof HTMLInputElement && e.target.files) {
            handleFiles(e.target.files);
        }
    }, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    if (dt && dt.files) {
        handleFiles(dt.files);
    }
}

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

async function uploadFile(file) {
    if (loading) loading.style.display = 'block';
    const formData = new FormData();
    formData.append('file', file);

    try {
        const API_URL = "https://api.nine-security.com/api/dmarc/analyze";

        const resp = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            throw new Error((json && json.error) || `Analysis failed (${resp.status})`);
        }
        if (!json.ok || !json.data) {
            throw new Error((json && json.error) || 'Invalid response from analyzer');
        }
        renderReport(json.data);

        // Show results
        if (loading) loading.style.display = 'none';
        if (dropZone) dropZone.style.display = 'none';
        if (results) results.style.display = 'block';

    } catch (e) {
        alert("Error processing file: " + e.message);
        if (loading) loading.style.display = 'none';
    }
}

function renderReport(data) {
    const reportMeta = document.getElementById('report-meta');
    const passRate = document.getElementById('pass-rate');
    if (reportMeta) reportMeta.innerText = `Org: ${data.meta.org} | Messages: ${data.meta.total_messages}`;
    if (passRate) passRate.innerText = `${data.stats.pass_rate}%`;

    const authChartCanvas = document.getElementById('authChart');
    if (authChartCanvas && authChartCanvas instanceof HTMLCanvasElement) {
        const ctxAuth = authChartCanvas.getContext('2d');
        if (ctxAuth) {
            // @ts-ignore
            new Chart(ctxAuth, {
                type: 'doughnut',
                data: {
                    labels: ['Fully Aligned', 'Auth Failed', 'Partial'],
                    datasets: [{
                        data: [data.stats.fully_aligned, data.stats.auth_failed, data.stats.partially_aligned],
                        backgroundColor: ['#00ff41', '#ff0055', '#ffaa00'],
                        borderWidth: 0
                    }]
                },
                options: { plugins: { legend: { position: 'bottom', labels: { color: '#ccc' } } } }
            });
        }
    }

    const sourceChartCanvas = document.getElementById('sourceChart');
    if (sourceChartCanvas && sourceChartCanvas instanceof HTMLCanvasElement) {
        const ctxSource = sourceChartCanvas.getContext('2d');
        if (ctxSource) {
            // @ts-ignore
            new Chart(ctxSource, {
                type: 'bar',
                data: {
                    labels: data.sources.slice(0, 5).map(s => s.ip),
                    datasets: [{
                        label: 'Volume',
                        data: data.sources.slice(0, 5).map(s => s.count),
                        backgroundColor: '#00e5ff'
                    }]
                },
                options: {
                    scales: {
                        x: { ticks: { color: '#888' } },
                        y: { ticks: { color: '#888' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    const tbody = document.querySelector('#data-table tbody');
    if (tbody) {
        tbody.innerHTML = data.sources.map(s => {
            const status = (s.dkim_fail === 0 && s.spf_fail === 0) ? 'pass' : 'fail';
            return `
                <tr>
                    <td>${s.ip}</td>
                    <td>${s.count}</td>
                    <td><span class="badge ${s.dkim_fail > 0 ? 'fail' : 'pass'}">${s.dkim_fail > 0 ? 'FAIL' : 'PASS'}</span></td>
                    <td><span class="badge ${s.spf_fail > 0 ? 'fail' : 'pass'}">${s.spf_fail > 0 ? 'FAIL' : 'PASS'}</span></td>
                    <td><span class="badge ${status}">${status.toUpperCase()}</span></td>
                </tr>
            `;
        }).join('');
    }
}
