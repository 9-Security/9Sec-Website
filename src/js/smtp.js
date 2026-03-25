import { startAssessment, getAssessmentStatus, getAssessmentReport } from './api.js';
import { validateEmail, showNotice, escapeHtml, getStatusClass, API_BASE } from './utils.js';

let currentAssessmentId = null;
let pollInterval = null;
let scanLogMarqueeInterval = null;

const SCAN_LOG_MAX_LINES = 14;
const SCAN_LOG_INTERVAL_MS = 1800;

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
            if (data.status === 'completed') {
                clearInterval(pollInterval);
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

            renderForensicReportHtml(data.report_html, data.domain || id, data);
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

    if (reportDomain) reportDomain.textContent = domain;
    if (reportContent) reportContent.innerHTML = html;

    if (btnDownload) {
        const reportUrl = `${API_BASE}/api/assessment/${fullData.assessment_id}/report?download=1&format=pdf`;
        btnDownload.onclick = () => window.open(reportUrl, "_blank");
    }

    // Attach expand/collapse listeners for remediation cards if they exist
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
}
