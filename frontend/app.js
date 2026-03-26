const API_BASE_URL = 'https://cloud-security-copilot-wsp1.onrender.com/api';

let severityChart = null;
let costChart = null;

// 🔥 Wake backend immediately
fetch(`${API_BASE_URL}/health`).catch(() => {
console.log("Waking backend...");
});

// Retry fetch (handles Render cold start)
async function fetchWithRetry(url, options = {}, retries = 3) {
try {
const response = await fetch(url, options);
return response;
} catch (error) {
if (retries > 0) {
console.log('Retrying...', retries);
await new Promise(res => setTimeout(res, 8000)); // ⬅️ increased delay
return fetchWithRetry(url, options, retries - 1);
}
throw error;
}
}

// Initialize dashboard
async function initDashboard() {
console.log('Initializing dashboard...');
console.log("Connected to backend:", API_BASE_URL);

```
showLoadingText();

await loadSummary();
await loadSecurityAnalysis();
await loadCostAnalysis();
await loadRecommendations();

updateLastUpdate();
```

}

// 🔥 Show loading placeholders
function showLoadingText() {
document.getElementById('totalResources').textContent = "Loading...";
document.getElementById('totalIssues').textContent = "Loading...";
document.getElementById('criticalIssues').textContent = "Loading...";
document.getElementById('monthlyCost').textContent = "Loading...";
document.getElementById('potentialSavings').textContent = "Loading...";
}

// Load summary statistics
async function loadSummary() {
try {
const response = await fetchWithRetry(`${API_BASE_URL}/summary`);
const data = await response.json();

```
    document.getElementById('totalResources').textContent = data.summary.total_resources;
    document.getElementById('totalIssues').textContent = data.summary.total_misconfigurations;
    document.getElementById('criticalIssues').textContent = `Critical: ${data.summary.critical_misconfigurations}`;
    document.getElementById('monthlyCost').textContent = `$${data.summary.total_monthly_cost.toLocaleString()}`;
    document.getElementById('potentialSavings').textContent = `Potential savings: $${data.summary.total_optimization_potential.toLocaleString()}`;

    console.log('Summary loaded:', data.summary);
} catch (error) {
    console.error('Error loading summary:', error);
    showError('Backend is waking up... Please refresh in a few seconds');
}
```

}

// Load security analysis
async function loadSecurityAnalysis() {
try {
const response = await fetchWithRetry(`${API_BASE_URL}/security/analysis`);
const data = await response.json();

```
    document.getElementById('riskScore').textContent = data.overall_risk_score;
    document.getElementById('riskLevel').textContent = `Risk Level: ${data.risk_level}`;

    createSeverityChart(data.severity_distribution);
    displayAIInsights(data.ai_insights);
    displayCriticalFindings(data.critical_findings);
    displayTopMisconfigurations(data.top_misconfiguration_types);

    console.log('Security analysis loaded');
} catch (error) {
    console.error('Error loading security analysis:', error);
}
```

}

// Load cost analysis
async function loadCostAnalysis() {
try {
const response = await fetchWithRetry(`${API_BASE_URL}/cost/analysis`);
const data = await response.json();

```
    createCostChart(data.cost_by_resource_type);
    displayOptimizationOpportunities(data.top_optimization_opportunities);

    console.log('Cost analysis loaded');
} catch (error) {
    console.error('Error loading cost analysis:', error);
}
```

}

// Load recommendations
async function loadRecommendations() {
try {
const response = await fetchWithRetry(`${API_BASE_URL}/recommendations`);
const data = await response.json();

```
    displayRecommendations(data.security_recommendations, data.cost_recommendations);

    console.log('Recommendations loaded');
} catch (error) {
    console.error('Error loading recommendations:', error);
}
```

}

// Charts (same as before)
function createSeverityChart(severityData) {
const ctx = document.getElementById('severityChart').getContext('2d');

```
if (severityChart) severityChart.destroy();

severityChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(severityData),
        datasets: [{
            label: 'Issues',
            data: Object.values(severityData),
            backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745']
        }]
    }
});
```

}

function createCostChart(costData) {
const ctx = document.getElementById('costChart').getContext('2d');

```
if (costChart) costChart.destroy();

costChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: Object.keys(costData),
        datasets: [{
            data: Object.values(costData)
        }]
    }
});
```

}

// Remaining UI functions (same)
function displayAIInsights(insights) {
const container = document.getElementById('aiInsights');
container.innerHTML = insights.map(i => `<div>🤖 ${i}</div>`).join('');
}

function displayCriticalFindings(findings) {
const container = document.getElementById('criticalFindings');
container.innerHTML = findings.map(f => `<div>⚠️ ${f.type}</div>`).join('');
}

function displayTopMisconfigurations(misconfigs) {
const container = document.getElementById('topMisconfigs');
container.innerHTML = misconfigs.map(m => `<div>${m.type}</div>`).join('');
}

function displayOptimizationOpportunities(opps) {
const container = document.getElementById('costOptimization');
container.innerHTML = opps.map(o => `<div>${o.resource_name}</div>`).join('');
}

function displayRecommendations(sec, cost) {
const container = document.getElementById('recommendations');
container.innerHTML = [...sec, ...cost].map(r => `<div>${r}</div>`).join('');
}

// Refresh
async function refreshData() {
await fetchWithRetry(`${API_BASE_URL}/regenerate-data`, { method: 'POST' });
initDashboard();
}

// Update time
function updateLastUpdate() {
document.getElementById('lastUpdate').textContent =
`Last updated: ${new Date().toLocaleTimeString()}`;
}

function showError(msg) {
console.error(msg);
}

// Events
document.addEventListener('DOMContentLoaded', initDashboard);
document.getElementById('refreshDataBtn').addEventListener('click', refreshData);
