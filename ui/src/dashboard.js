/**
 * ADR Checker Dashboard
 * JavaScript for the ADR Checker Dashboard UI
 */

// Global state
let adrData = null;
let currentPage = 1;
const itemsPerPage = 9; // Number of ADRs per page

// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileInputPlaceholder = document.getElementById('fileInput-placeholder');
const dashboardContent = document.getElementById('dashboard-content');
const placeholder = document.getElementById('placeholder');
const totalAdrs = document.getElementById('total-adrs');
const totalReferences = document.getElementById('total-references');
const totalIssues = document.getElementById('total-issues');
const missingAdrs = document.getElementById('missing-adrs');
const summaryIssuesContainer = document.getElementById('summary-issues-container');
const issuesContainer = document.getElementById('issues-container');
const adrsContainer = document.getElementById('adrs-container');
const fileExplorer = document.getElementById('file-explorer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('search-results');
const applyFiltersBtn = document.getElementById('applyFilters');
const adrsPagination = document.getElementById('adrs-pagination');
const acceptedCount = document.getElementById('accepted-count');
const proposedCount = document.getElementById('proposed-count');
const rejectedCount = document.getElementById('rejected-count');
const deprecatedCount = document.getElementById('deprecated-count');
const viewAllIssuesBtn = document.getElementById('view-all-issues');
const modalContainer = document.getElementById('modal-container');

// Tab navigation
const tabButtons = document.querySelectorAll('[data-tab]');
const tabPanels = document.querySelectorAll('.tab-panel');

// Event Listeners
fileInput.addEventListener('change', handleFileUpload);
fileInputPlaceholder.addEventListener('change', handleFileUpload);
applyFiltersBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('input', debounce(handleSearch, 300));
viewAllIssuesBtn.addEventListener('click', () => {
  activateTab('issues-tab');
});

// Tab navigation
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    activateTab(button.id);
  });
});

// Try to load the sample report automatically on page load
document.addEventListener('DOMContentLoaded', () => {
  // Try to load the sample-report.json file automatically
  fetch('../sample-report.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Sample report not found');
      }
      return response.json();
    })
    .then(data => {
      adrData = data;
      renderDashboard();
      dashboardContent.style.display = 'block';
      placeholder.style.display = 'none';
      console.log('Automatically loaded sample-report.json');
    })
    .catch(error => {
      console.log('Could not auto-load sample report:', error.message);
      console.log('Please upload a report file manually');
      dashboardContent.style.display = 'none';
      placeholder.style.display = 'block';
    });
});

/**
 * Activate a tab
 */
function activateTab(tabId) {
  // Update tab buttons
  tabButtons.forEach(button => {
    if (button.id === tabId) {
      button.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
      button.classList.remove('text-gray-500', 'hover:text-blue-600', 'hover:border-b-2', 'hover:border-blue-600');
    } else {
      button.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
      button.classList.add('text-gray-500', 'hover:text-blue-600', 'hover:border-b-2', 'hover:border-blue-600');
    }
  });

  // Show the corresponding panel
  const panelId = document.getElementById(tabId).getAttribute('data-tab');
  tabPanels.forEach(panel => {
    if (panel.id === panelId) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });
}

/**
 * Handle file upload
 */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      adrData = JSON.parse(e.target.result);
      renderDashboard();
      dashboardContent.style.display = 'block';
      placeholder.style.display = 'none';
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Render the dashboard with the loaded data
 */
function renderDashboard() {
  if (!adrData) return;
  
  // Update summary cards
  totalAdrs.textContent = adrData.documents.length;
  totalReferences.textContent = adrData.references.length;
  totalIssues.textContent = adrData.issues.length;
  
  // Count missing ADR documents
  const missingAdrCount = adrData.issues.filter(
    issue => issue.type === 'missing_document'
  ).length;
  missingAdrs.textContent = missingAdrCount;
  
  // Render status distribution
  renderStatusDistribution();
  
  // Render summary issues
  renderSummaryIssues();
  
  // Render issues
  renderIssues();
  
  // Render ADR documents
  renderAdrDocuments();
  
  // Render file explorer
  renderFileExplorer();
}

/**
 * Render status distribution
 */
function renderStatusDistribution() {
  if (!adrData || !adrData.documents) return;
  
  const statusCounts = {
    accepted: 0,
    proposed: 0,
    rejected: 0,
    deprecated: 0
  };
  
  adrData.documents.forEach(doc => {
    const status = doc.status.toLowerCase();
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  });
  
  acceptedCount.querySelector('span.font-semibold').textContent = statusCounts.accepted;
  proposedCount.querySelector('span.font-semibold').textContent = statusCounts.proposed;
  rejectedCount.querySelector('span.font-semibold').textContent = statusCounts.rejected;
  deprecatedCount.querySelector('span.font-semibold').textContent = statusCounts.deprecated;
}
