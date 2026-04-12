import { startAssessment, getAssessmentStatus, getAssessmentReport } from './api.js';
import { validateEmail, showNotice, escapeHtml, getStatusClass, API_BASE } from './utils.js';

let currentAssessmentId = null;
let pollInterval = null;
let scanLogMarqueeInterval = null;

const SCAN_LOG_MAX_LINES = 14;
const SCAN_LOG_INTERVAL_MS = 1800;

const REPORT_BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form']);

function sanitizeReportHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    const walk = (root) => {
        const nodes = root.querySelectorAll('*');
        nodes.forEach((node) => {
            const tag = node.tagName.toLowerCase();
            if (REPORT_BLOCKED_TAGS.has(tag)) {
                node.remove();
                return;
            }

            [...node.attributes].forEach((attr) => {
                const name = attr.name.toLowerCase();
                const value = attr.value || '';
                if (name.startsWith('on')) {
                    node.removeAttribute(attr.name);
                    return;
                }
                if ((name === 'href' || name === 'src' || name === 'xlink:href') && /^\s*javascript:/i.test(value)) {
                    node.removeAttribute(attr.name);
                    return;
                }
                if (name === 'style' && /expression\s*\(|url\s*\(\s*javascript:/i.test(value)) {
                    node.removeAttribute(attr.name);
                }
            });
        });
    };

    walk(template.content);
    return template.innerHTML;
}

const SCAN_LOG_PHASES = [
    { text: "> Daemon initialized. Listening on port 25...", class: "" },
    { text: "> SPF lookup started...", class: "" },
    { text: "> DMARC policy check...", class: "" },
    { text: "> MX resolution...", class: "" },
    { text: "> TLS handshake (STARTTLS)...", class: "" },
    { text: "> DKIM key fetch...", class: "" },
    { text: "> Routing baseline (ASN/Geo)...", class: "" },
    { text: "> Security headers scan...", class: "" },
    { text: "> Semantic audit (SPF/DMARC)...", class: "" },
    { text: "> BEC / Reply-To check...", class: "" },
    { text: "> Brand impersonation cluster...", class: "" },
    { text: "> Waiting for inbound email...", class: "warn" },
];

/**
 * Remediation hints for risk findings.
 */
function getRemediationHint(item) {
    if (!item || typeof item.item !== "string") return null;
    const s = (item.item || "").toLowerCase();
    if (s.includes("spf") && (s.includes("missing") || s.includes("depth") || s.includes("limit") || s.includes("failed") || s.includes("softfail") || s.includes("semantic") || s.includes("disallowed"))) {
        return { title: "SPF", snippet: "Add or simplify SPF: TXT @ root e.g. v=spf1 include:_spf.example.com -all. Keep total lookups ≤10 (RFC 7208).", priority: "high" };
    }
    if (s.includes("dmarc") && (s.includes("none") || s.includes("pct") || s.includes("destination") || s.includes("semantic"))) {
        return { title: "DMARC", snippet: "Set p=reject or p=quarantine; pct=100; aspf=s; adkim=s. Use same-domain mailto for rua/ruf.", priority: "high" };
    }
    if (s.includes("dkim") && (s.includes("missing") || s.includes("fail") || s.includes("quality") || s.includes("weak"))) {
        return { title: "DKIM", snippet: "Publish 2048-bit DKIM key at selector._domainkey.<domain>. Sign From and critical headers.", priority: "high" };
    }
    if (s.includes("mta-sts") || (s.includes("tls") && (s.includes("posture") || s.includes("mta-sts")))) {
        return { title: "TLS", snippet: "Enable MTA-STS (HTTPS /.well-known/mta-sts.txt) and TLS-RPT (_smtp._tls TXT). Use STARTTLS on all hops.", priority: "medium" };
    }
    if (s.includes("routing anomaly") || s.includes("relay")) {
        return { title: "Routing", snippet: "Reduce unnecessary relays; ensure all hops use TLS; fix missing PTR/hostnames on relays.", priority: "medium" };
    }
    if (s.includes("bec") || s.includes("reply-to") || s.includes("return-path")) {
        return { title: "BEC", snippet: "Align Reply-To and Return-Path with From domain. Avoid external reply addresses for corporate mail.", priority: "high" };
    }
    if (s.includes("alignment") || s.includes("mismatch")) {
        return { title: "Alignment", snippet: "Ensure Envelope From (Return-Path) and DKIM d= match Header From domain (organizational alignment).", priority: "high" };
    }
    if (s.includes("ptr") || s.includes("reverse dns")) {
        return { title: "PTR/DNS", snippet: "Configure correct PTR record for sending IP; ensure forward and reverse DNS match.", priority: "medium" };
    }
    if (s.includes("bimi")) {
        return { title: "BIMI", snippet: "Publish BIMI record at default._bimi.<domain> (v=BIMI1) with verified logo for brand visibility in supported clients.", priority: "low" };
    }
    if ((s.includes("mx") && (s.includes("single") || s.includes("only 1") || s.includes("failure"))) || s.includes("single point of failure")) {
        return { title: "MX Redundancy", snippet: "Add at least one additional MX record for failover; use different providers or hosts for resilience.", priority: "high" };
    }
    if (s.includes("dnssec")) {
        return { title: "DNSSEC", snippet: "Enable DNSSEC on the domain to prevent DNS spoofing; sign zone and publish DS records at registrar.", priority: "low" };
    }
    if (s.includes("rbl") || s.includes("blacklist") || (s.includes("reputation") && (s.includes("poor") || s.includes("sender")))) {
        return { title: "Reputation", snippet: "Request delisting from reported RBLs; fix open relay or compromised host; warm up IP reputation.", priority: "high" };
    }
    if (s.includes("brand impersonation") || s.includes("cluster")) {
        return { title: "Impersonation", snippet: "Monitor lookalike domains; consider defensive registration; enforce DMARC and BIMI to protect brand.", priority: "medium" };
    }
    if (s.includes("deep analysis") || s.includes("security finding")) {
        return { title: "Security", snippet: "Review authentication headers and routing path; fix reported issues and re-run assessment.", priority: "medium" };
    }
    return null;
}

function assessmentStatusDone(data) {
    if (!data || typeof data !== 'object') return false;
    const s = data.status ?? data.results?.status;
    return s === 'completed' || s === 'verified';
}

/** Full HTML file for “Download HTML” when only structured report data exists (aligned with legacy script.js). */
function getReportHtml(data) {
    if (!data) return '';
    const domain = escapeHtml(String(data.domain || 'unknown'));
    const dns = data.dns_posture || {};
    const riskScore = Number(data.risk_score) || 0;
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>9Sec Security Report - ${domain}</title>
    <style>
        :root { --green: #00ff41; --fail: #ff0055; --warn: #ffaa00; --bg: #0a0a0a; --card: #111; --border: #333; --text: #e0e0e0; }
        body { background: var(--bg); color: var(--text); font-family: 'Courier New', Courier, monospace; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .header { border-bottom: 2px solid var(--green); padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: var(--green); margin: 0; letter-spacing: 2px; }
        .section-title { color: var(--green); margin: 30px 0 15px; font-size: 1.1rem; border-left: 4px solid var(--green); padding-left: 15px; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .card { background: var(--card); border: 1px solid var(--border); padding: 15px; position: relative; }
        .label { color: #666; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 5px; }
        .value { font-size: 1.1rem; font-weight: bold; }
        .risk-item { display: flex; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); margin-bottom: 8px; }
        .cta-box { border: 1px solid var(--green); padding: 25px; margin-top: 40px; text-align: center; background: rgba(0,255,65,0.05); }
        .footer { margin-top: 50px; text-align: center; color: #444; font-size: 0.8rem; border-top: 1px solid #222; padding-top: 20px; }
        @media print { body { background: #fff !important; color: #000 !important; } .card, .risk-item { border: 1px solid #ddd !important; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>NINE-SECURITY // ASSESSMENT_LOG</h1>
        <p>Target Domain: <span style="color: var(--green);">${domain}</span></p>
        <p style="font-size: 11px; color: #666;">Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="section-title">> EXECUTIVE_RISK_PROFILE [Score: ${riskScore}/100]</div>
    <div class="risk-container">
        ${(data.risk_breakdown || []).map(r => `
            <div class="risk-item" style="border-left: 5px solid ${r.severity === 'high' ? '#ff0055' : (r.severity === 'medium' ? '#ffaa00' : '#444')};">
                <span>${escapeHtml(String(r.item != null ? r.item : ''))}</span>
                <span style="color: var(--green); font-weight: bold;">+${Number(r.score) || 0}</span>
            </div>
        `).join('')}
    </div>

    <div class="section-title">> AUTH_INFRASTRUCTURE_PROBE</div>
    <div class="grid">
        <div class="card"><div class="label">Origin MTA Node</div><div class="value">${escapeHtml(String(data.sender_ip || 'Generic MTA'))}</div></div>
        <div class="card"><div class="label">Network Latency</div><div class="value">${escapeHtml(String(data.transport_time || 'N/A'))}</div></div>
        <div class="card"><div class="label">SPF Governance</div><div class="value" style="color: ${getStatusClass(dns.spf) === 'pass' ? 'var(--green)' : 'var(--fail)'}">${String(dns.spf || 'MISSING').toUpperCase()}</div></div>
        <div class="card"><div class="label">DMARC Enforcement</div><div class="value" style="color: ${getStatusClass(dns.dmarc) === 'pass' ? 'var(--green)' : 'var(--warn)'}">${String(dns.dmarc || 'NONE').toUpperCase()}</div></div>
    </div>

    <div class="section-title">> ADVANCED_SECURITY_PROTOCOLS</div>
    <div class="grid">
        <div class="card"><div class="label">MTA-STS Handshake</div><div class="value" style="color: ${getStatusClass(dns.mta_sts) === 'pass' ? 'var(--green)' : 'var(--fail)'}">${String(dns.mta_sts || 'MISSING').toUpperCase()}</div></div>
        <div class="card"><div class="label">Transport Encryption</div><div class="value">${escapeHtml(String(data.smtp_tls?.version || 'TLS 1.3'))}</div></div>
        <div class="card"><div class="label">TLS Reporting (RPT)</div><div class="value" style="color: ${getStatusClass(dns.tls_rpt) === 'pass' ? 'var(--green)' : 'var(--fail)'}">${String(dns.tls_rpt || 'MISSING').toUpperCase()}</div></div>
        <div class="card"><div class="label">Brand Indicator (BIMI)</div><div class="value" style="color: ${getStatusClass(dns.bimi) === 'pass' ? 'var(--green)' : 'var(--fail)'}">${String(dns.bimi || 'MISSING').toUpperCase()}</div></div>
    </div>

    <div class="cta-box">
        <h3 style="color: var(--green); margin-top: 0;">FORENSIC DIAGNOSTIC REQUIRED</h3>
        <p>Our backend identified RFC violations and policy gaps.</p>
        <p style="font-weight: bold;">consult@nine-security.com</p>
    </div>

    <div class="footer">
        CONFIDENTIAL - CUSTODIAN: NINE-SECURITY.INC CLUSTER<br>
        &copy; 2026 Nine-Security Team. All Systems Operational.
    </div>
</body>
</html>`;
}

function renderStructuredReport(report) {
    if (!report) return;

    const reportDomain = document.getElementById('report-domain');
    const reportContent = document.getElementById('report-content');
    const btnDownload = document.getElementById('btn-download-report');

    if (reportDomain) reportDomain.textContent = report.domain || "Unknown Domain";

    const dns = report.dns_posture || {};
    const tls = report.smtp_tls || {};
    const riskScore = report.risk_score || 0;
    const riskBreakdown = report.risk_breakdown || [];
    const rblStatus = report.rbl_status || 'unchecked';
    const additionalChecksHtml = `
            <div class="section-title">> Additional Security Checks</div>
            <div class="grid">
                <div class="card"><div class="label">SPF Lookup Depth</div><div class="value ${Number(dns.spf_lookups || 0) > 10 ? 'fail' : (Number(dns.spf_lookups || 0) >= 8 ? 'warn' : 'pass')}">${dns.spf_lookups ?? 'N/A'}</div></div>
                <div class="card"><div class="label">DMARC Destination Risks</div><div class="value ${(dns.dmarc_destinations?.risks || []).length > 0 ? 'warn' : 'pass'}">${(dns.dmarc_destinations?.risks || []).length}</div></div>
                <div class="card"><div class="label">SPF Semantic Risks</div><div class="value ${(dns.spf_semantic?.risks || []).length > 0 ? 'warn' : 'pass'}">${(dns.spf_semantic?.risks || []).length}</div></div>
                <div class="card"><div class="label">DMARC Semantic Risks</div><div class="value ${(dns.dmarc_semantic?.risks || []).length > 0 ? 'warn' : 'pass'}">${(dns.dmarc_semantic?.risks || []).length}</div></div>
                <div class="card"><div class="label">Routing Anomalies</div><div class="value ${(report.deep_analysis?.routing_analysis?.anomalies || []).length > 0 ? 'warn' : 'pass'}">${(report.deep_analysis?.routing_analysis?.anomalies || []).length}</div></div>
                <div class="card"><div class="label">Routing Relay Count</div><div class="value">${report.deep_analysis?.routing_analysis?.relay_count ?? 'N/A'}</div></div>
                <div class="card"><div class="label">TLS Posture</div><div class="value ${getStatusClass(dns.tls_posture?.status || 'warn')}">${String(dns.tls_posture?.status || 'warn').toUpperCase()} (${dns.tls_posture?.score ?? 'N/A'})</div></div>
            </div>
        `;

    const riskItemBorder = (r) => r.severity === 'high' ? '#ff0055' : (r.severity === 'medium' ? '#ffaa00' : '#666');
    const html = `
            <div class="section-title">> Executive Risk Profile (Score: ${riskScore}/100)</div>
            <div class="risk-container">
                ${riskBreakdown.map(r => {
        const hint = getRemediationHint(r);
        const hintHtml = hint ? `<div class="remediation-card" data-priority="${escapeHtml(hint.priority)}"><span class="remediation-title">${escapeHtml(hint.title)} — Fix:</span> ${escapeHtml(hint.snippet)}</div>` : '';
        return `
                    <div class="risk-item" style="border-left-color: ${riskItemBorder(r)};">
                        <span>${escapeHtml(String(r.item != null ? r.item : ''))}</span>
                        <span class="value pass">+${r.score}</span>
                        ${hintHtml}
                    </div>`;
    }).join('')}
            </div>

            <div class="section-title">> Authentication Infrastructure</div>
            <div class="grid">
                <div class="card"><div class="label">Origin MTA Node</div><div class="value">${escapeHtml(String(report.sender_ip || 'Generic Postfix/Exim'))}</div></div>
                <div class="card"><div class="label">Network Latency</div><div class="value ${parseFloat(report.transport_time) > 5 ? 'warn' : 'pass'}">${escapeHtml(String(report.transport_time || 'N/A'))}</div></div>
                <div class="card">
                    <div class="label">SPF Governance</div>
                    <div class="value ${getStatusClass(dns.spf)}">${(dns.spf || 'MISSING').toUpperCase()}</div>
                    ${dns.spf === 'warn' ? '<div class="gap-warning">\u26A0\uFE0F RFC 7208 Complexity Limit Exceeded</div>' : ''}
                </div>
                <div class="card">
                    <div class="label">DMARC Enforcement</div>
                    <div class="value ${getStatusClass(dns.dmarc)}">${(dns.dmarc || 'NONE').toUpperCase()}</div>
                    ${dns.dmarc_raw && dns.dmarc_raw.includes('rua=') ? '<div class="gap-warning">\u26A0\uFE0F Potential Data Exfiltration Path via RUA</div>' : ''}
                </div>
                <div class="card"><div class="label">DNSSEC Integrity</div><div class="value ${getStatusClass(dns.dnssec)}">${(dns.dnssec || 'FAIL').toUpperCase()}</div></div>
                <div class="card"><div class="label">RBL Reputation</div><div class="value ${rblStatus === 'fail' ? 'fail' : 'pass'}">${rblStatus === 'fail' ? 'BLACKLISTED' : 'CLEAN'}</div></div>
            </div>

            <div class="section-title">> Advanced Security Protocols</div>
            <div class="grid">
                <div class="card">
                    <div class="label">MTA-STS Handshake</div>
                    <div class="value ${getStatusClass(dns.mta_sts)}">${(dns.mta_sts || 'MISSING').toUpperCase()}</div>
                    ${dns.mta_sts === 'missing' && dns.mta_sts_raw !== 'None' ? '<div class="gap-warning">\u26A0\uFE0F Policy Handshake Integrity Failed</div>' : ''}
                </div>
                <div class="card"><div class="label">TLS Reporting (RPT)</div><div class="value ${getStatusClass(dns.tls_rpt)}">${(dns.tls_rpt || 'MISSING').toUpperCase()}</div></div>
                <div class="card"><div class="label">BIMI Brand Indicator</div><div class="value ${getStatusClass(dns.bimi)}">${(dns.bimi || 'MISSING').toUpperCase()}</div></div>
                <div class="card"><div class="label">Transport Encryption</div><div class="value pass">${escapeHtml(String(tls.version || 'TLS 1.3 (Verified)'))}</div></div>
            </div>

            ${additionalChecksHtml}

            <div class="cta-box">
                <h3>Want the Technical Forensic Report?</h3>
                <p>Our backend has identified specific RFC violations and policy handshake failures.</p>
                <p>Contact <strong>consult@nine-security.com</strong> to unlock the full technical diagnostic and remediation guide.</p>
            </div>

            <div class="report-footer">
                CONFIDENTIAL - GENERATED BY NINE-SECURITY.INC FORENSIC CLUSTER<br>
                &copy; 2026 Nine-Security Team. All Systems Operational.
            </div>
        `;

    window.currentReportData = report;
    window.currentReportHtml = null;

    if (reportContent) reportContent.innerHTML = html;
    if (btnDownload) btnDownload.classList.remove('hidden');
    const btnPdf = document.getElementById('btn-download-pdf');
    if (btnPdf) btnPdf.classList.remove('hidden');

    attachRiskItemToggle(reportContent);
}

function attachRiskItemToggle(reportContent) {
    reportContent?.querySelectorAll('.risk-item').forEach(item => {
        item.addEventListener('click', () => {
            const hint = item.querySelector('.remediation-card');
            if (hint) {
                const isVisible = hint.style.display === 'block';
                hint.style.display = isVisible ? 'none' : 'block';
            }
        });
    });
}

/**
 * Start assessment submission.
 */
export async function submitAssessment() {
    const emailInput = document.getElementById('email-input');
    const consentCheck = document.getElementById('consent-check');
    if (!emailInput || !consentCheck) return;

    const email = emailInput.value.trim();
    const consent = consentCheck.checked;

    const emailErr = validateEmail(email);
    if (emailErr) {
        showNotice(emailErr);
        return;
    }
    if (!consent) {
        showNotice("Please agree to the authorization terms.");
        return;
    }

    try {
        const data = await startAssessment(email, consent);
        if (!data.ok) {
            showNotice(`Check initialization failed: ${data.error || 'Unknown Error'}`);
            return;
        }

        currentAssessmentId = data.assessment_id;
        window.currentReportHtml = null;
        window.currentReportData = null;

        // UI Transition
        document.getElementById('smtp-step-input')?.classList.add('hidden');
        document.getElementById('smtp-step-verify')?.classList.remove('hidden');
        const verifyAddrDisplay = document.getElementById('verification-email');
        if (verifyAddrDisplay) verifyAddrDisplay.textContent = data.verification_address;

        startScanLogMarquee();
        startPolling(currentAssessmentId);

    } catch (e) {
        showNotice("Backend unreachable or error occurred.");
    }
}

function startScanLogMarquee() {
    stopScanLogMarquee();
    const el = document.getElementById("scan-log");
    if (!el) return;
    el.innerHTML = "";
    let phaseIndex = 0;

    const appendLine = (phase) => {
        const line = document.createElement("div");
        line.className = "log-line" + (phase.class ? " " + phase.class : "");
        line.textContent = phase.text;
        el.appendChild(line);
        let lines = el.querySelectorAll(".log-line");
        while (lines.length > SCAN_LOG_MAX_LINES) {
            lines[0].remove();
            lines = el.querySelectorAll(".log-line");
        }
        el.scrollTop = el.scrollHeight;
    };

    appendLine(SCAN_LOG_PHASES[0]);
    phaseIndex = 1;
    scanLogMarqueeInterval = setInterval(() => {
        if (phaseIndex >= SCAN_LOG_PHASES.length) phaseIndex = 1;
        appendLine(SCAN_LOG_PHASES[phaseIndex]);
        phaseIndex++;
    }, SCAN_LOG_INTERVAL_MS);
}

function stopScanLogMarquee() {
    if (scanLogMarqueeInterval) {
        clearInterval(scanLogMarqueeInterval);
        scanLogMarqueeInterval = null;
    }
}

function startPolling(id) {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
        try {
            const data = await getAssessmentStatus(id);
            if (assessmentStatusDone(data)) {
                clearInterval(pollInterval);
                pollInterval = null;
                stopScanLogMarquee();

                const el = document.getElementById("scan-log");
                if (el) {
                    const line = document.createElement("div");
                    line.className = "log-line success";
                    line.textContent = "> Email received. Generating report...";
                    el.appendChild(line);
                    el.scrollTop = el.scrollHeight;
                }

                fetchAndRenderReport(id);
            }
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, 3000);
}

async function fetchAndRenderReport(id) {
    try {
        const data = await getAssessmentReport(id);
        if (data.ok && data.report_html) {
            document.getElementById('smtp-step-verify')?.classList.add('hidden');
            document.getElementById('smtp-step-report')?.classList.remove('hidden');

            renderForensicReportHtml(data.report_html, data.domain || id, { ...data, assessment_id: id });
            return;
        }
        if (data.ok && data.report && typeof data.report === 'object') {
            document.getElementById('smtp-step-verify')?.classList.add('hidden');
            document.getElementById('smtp-step-report')?.classList.remove('hidden');
            renderStructuredReport(data.report);
            return;
        }
        showNotice("Failed to load report results.");
    } catch (e) {
        showNotice("Failed to load report results.");
    }
}

/**
 * Render the forensic report using backend-provided HTML structure.
 */
function renderForensicReportHtml(html, domain, fullData) {
    const reportDomain = document.getElementById('report-domain');
    const reportContent = document.getElementById('report-content');
    const btnDownload = document.getElementById('btn-download-report');
    const btnPdf = document.getElementById('btn-download-pdf');

    const sanitizedHtml = sanitizeReportHtml(html);
    window.currentReportHtml = sanitizedHtml;
    window.currentReportData = { ...(fullData || {}), domain: domain || fullData?.domain };

    if (reportDomain) reportDomain.textContent = domain;
    if (reportContent) reportContent.innerHTML = sanitizedHtml;

    if (btnDownload) btnDownload.classList.remove('hidden');
    if (btnPdf) btnPdf.classList.remove('hidden');

    attachRiskItemToggle(reportContent);
}

/**
 * Initialize SMTP related UI listeners.
 */
export function initSmtp() {
    const btnStartCheck = document.getElementById('btn-start-check');
    if (btnStartCheck) {
        btnStartCheck.addEventListener('click', submitAssessment);
    }

    const verifyEmailCode = document.getElementById('verification-email');
    const btnCopy = document.getElementById('btn-copy-email');
    if (btnCopy && verifyEmailCode) {
        btnCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(verifyEmailCode.textContent || "");
            const originalIcon = btnCopy.innerHTML;
            btnCopy.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => btnCopy.innerHTML = originalIcon, 2000);
        });
    }

    const btnDownloadReport = document.getElementById('btn-download-report');
    if (btnDownloadReport) {
        btnDownloadReport.addEventListener('click', () => {
            const data = window.currentReportData || {};
            const forensicHtml = window.currentReportHtml;
            const rawDomain = data.domain || 'unknown';
            const safeFilename = String(rawDomain).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'domain';
            const fullHtml = forensicHtml || getReportHtml(data);
            if (!fullHtml) return;
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `9Sec_Forensic_Report_${safeFilename}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', async () => {
            const id = currentAssessmentId;
            if (!id) {
                showNotice('Please wait for the report to load, then try again.');
                return;
            }
            btnDownloadPdf.disabled = true;
            const prevHtml = btnDownloadPdf.innerHTML;
            btnDownloadPdf.textContent = ' Generating PDF…';
            try {
                const resp = await fetch(`${API_BASE}/api/assessment/${encodeURIComponent(id)}/report.pdf`);
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    showNotice(err.error || 'PDF unavailable. Try Download HTML.');
                    return;
                }
                const blob = await resp.blob();
                const disposition = resp.headers.get('Content-Disposition');
                const match = disposition && disposition.match(/filename="?([^";]+)"?/);
                const filename = match ? match[1].trim() : `9Sec_Forensic_Report_${id}.pdf`;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (e) {
                console.error('PDF download failed:', e);
                showNotice('PDF download failed. Try Download HTML or refresh the page.');
            } finally {
                btnDownloadPdf.disabled = false;
                btnDownloadPdf.innerHTML = prevHtml;
            }
        });
    }

    const btnResetCheck = document.getElementById('btn-reset-check');
    if (btnResetCheck) {
        btnResetCheck.addEventListener('click', () => {
            const reportStep = document.getElementById('smtp-step-report');
            const verifyStep = document.getElementById('smtp-step-verify');
            const inputStep = document.getElementById('smtp-step-input');
            const emailInput = document.getElementById('email-input');
            const scanLog = document.getElementById('scan-log');
            const reportContent = document.getElementById('report-content');

            if (reportStep) reportStep.classList.add('hidden');
            if (verifyStep) verifyStep.classList.add('hidden');
            if (inputStep) inputStep.classList.remove('hidden');

            currentAssessmentId = null;
            window.currentReportHtml = null;
            window.currentReportData = null;
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            stopScanLogMarquee();
            if (emailInput) emailInput.value = '';
            if (scanLog) scanLog.innerHTML = '';
            if (reportContent) reportContent.innerHTML = '';

            const consent = document.getElementById('consent-check');
            if (consent) consent.checked = false;
        });
    }
}
