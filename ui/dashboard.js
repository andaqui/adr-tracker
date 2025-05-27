/**
 * ADR Tracker Dashboard
 * JavaScript for the ADR Tracker Dashboard UI
 */

// Global state
let adrData = null;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const dashboardContent = document.getElementById('dashboard-content');
const totalAdrs = document.getElementById('total-adrs');
const totalReferences = document.getElementById('total-references');
const totalIssues = document.getElementById('total-issues');
const missingAdrs = document.getElementById('missing-adrs');
const issuesContainer = document.getElementById('issues-container');
const adrsContainer = document.getElementById('adrs-container');
const fileExplorer = document.getElementById('file-explorer');
const searchInput = document.getElementById('searchInput');
const applyFiltersBtn = document.getElementById('applyFilters');

// Event Listeners
fileInput.addEventListener('change', handleFileUpload);
applyFiltersBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('input', debounce(applyFilters, 300));

// Try to load the sample report automatically on page load
document.addEventListener('DOMContentLoaded', () => {
  // Try to load the sample-report.json file automatically
  fetch('sample-report.json')
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
      console.log('Automatically loaded sample-report.json');
    })
    .catch(error => {
      console.log('Could not auto-load sample report:', error.message);
      console.log('Please upload a report file manually');
    });
});

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
  
  // Render issues
  renderIssues();
  
  // Render ADR documents
  renderAdrDocuments();
  
  // Render file explorer
  renderFileExplorer();
}

/**
 * Render issues section
 */
function renderIssues() {
  if (!adrData || !adrData.issues || adrData.issues.length === 0) {
    issuesContainer.innerHTML = '<p class="text-muted">No issues found</p>';
    return;
  }
  
  // Group issues by type
  const issuesByType = {};
  adrData.issues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  let html = '';
  
  // Missing documents
  if (issuesByType.missing_document) {
    html += `<h3 class="h6">Missing ADR Documents (${issuesByType.missing_document.length})</h3>`;
    html += '<div class="mb-3">';
    issuesByType.missing_document.forEach(issue => {
      html += `
        <div class="issue-item issue-error">
          <strong>${issue.adrId}</strong> referenced in ${issue.file}:${issue.line}
        </div>
      `;
    });
    html += '</div>';
  }
  
  // Unused documents
  if (issuesByType.unused_document) {
    html += `<h3 class="h6">Unused ADR Documents (${issuesByType.unused_document.length})</h3>`;
    html += '<div class="mb-3">';
    issuesByType.unused_document.forEach(issue => {
      html += `
        <div class="issue-item issue-warning">
          <strong>${issue.adrId}</strong> is not referenced in any source file
        </div>
      `;
    });
    html += '</div>';
  }
  
  // Conflicting references
  if (issuesByType.conflicting_reference) {
    html += `<h3 class="h6">Conflicting ADR References (${issuesByType.conflicting_reference.length})</h3>`;
    html += '<div class="mb-3">';
    issuesByType.conflicting_reference.forEach(issue => {
      html += `
        <div class="issue-item issue-error">
          Multiple ADRs referenced at ${issue.file}:${issue.line}: ${issue.message}
        </div>
      `;
    });
    html += '</div>';
  }
  
  // Other issues
  const otherTypes = Object.keys(issuesByType).filter(type => 
    !['missing_document', 'unused_document', 'conflicting_reference'].includes(type)
  );
  
  if (otherTypes.length > 0) {
    const otherIssues = otherTypes.flatMap(type => issuesByType[type]);
    html += `<h3 class="h6">Other Issues (${otherIssues.length})</h3>`;
    html += '<div class="mb-3">';
    otherIssues.forEach(issue => {
      html += `
        <div class="issue-item issue-warning">
          ${issue.message}${issue.file ? ` in ${issue.file}` : ''}${issue.line ? `:${issue.line}` : ''}
        </div>
      `;
    });
    html += '</div>';
  }
  
  issuesContainer.innerHTML = html;
}

/**
 * Render ADR documents section
 */
function renderAdrDocuments() {
  if (!adrData || !adrData.documents || adrData.documents.length === 0) {
    adrsContainer.innerHTML = '<p class="text-muted">No ADR documents found</p>';
    return;
  }
  
  // Get the current filter values
  const statusFilters = getStatusFilters();
  const searchTerm = searchInput.value.toLowerCase();
  
  // Filter documents
  const filteredDocs = adrData.documents.filter(doc => {
    // Filter by status
    if (!statusFilters.includes(doc.status)) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !matchesSearchTerm(doc, searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  if (filteredDocs.length === 0) {
    adrsContainer.innerHTML = '<p class="text-muted">No ADR documents match the current filters</p>';
    return;
  }
  
  let html = '';
  
  filteredDocs.forEach(doc => {
    const refCount = adrData.references.filter(ref => ref.id === doc.id).length;
    const statusClass = getStatusClass(doc.status);
    
    html += `
      <div class="card mb-3">
        <div class="card-header">
          <strong>${doc.id}</strong> - ${doc.title}
        </div>
        <div class="card-body">
          <p>
            Status: <span class="status-badge ${statusClass}">${doc.status}</span>
          </p>
          ${doc.date ? `<p>Date: ${doc.date}</p>` : ''}
          ${doc.tags && doc.tags.length > 0 ? `
          <p>
            Tags: ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
          </p>
          ` : ''}
          <p>References in code: ${refCount}</p>
          <p>Path: ${doc.path}</p>
        </div>
      </div>
    `;
  });
  
  adrsContainer.innerHTML = html;
}

/**
 * Render file explorer section
 */
function renderFileExplorer() {
  if (!adrData || !adrData.references || adrData.references.length === 0) {
    fileExplorer.innerHTML = '<p class="text-muted">No files with ADR references</p>';
    return;
  }
  
  // Group references by file
  const fileMap = {};
  adrData.references.forEach(ref => {
    if (!fileMap[ref.file]) {
      fileMap[ref.file] = [];
    }
    fileMap[ref.file].push(ref);
  });
  
  const files = Object.keys(fileMap).sort();
  
  let html = '<ul class="list-group">';
  
  files.forEach(file => {
    const refs = fileMap[file];
    const adrIds = [...new Set(refs.map(ref => ref.id))];
    
    html += `
      <li class="list-group-item">
        <div class="file-item" data-file="${file}">
          <div><strong>${getFileName(file)}</strong></div>
          <div class="text-muted small">${file}</div>
          <div>
            ${adrIds.map(id => `<span class="badge bg-secondary me-1">${id}</span>`).join('')}
          </div>
        </div>
      </li>
    `;
  });
  
  html += '</ul>';
  fileExplorer.innerHTML = html;
  
  // Add click event listeners to file items
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
      const file = item.getAttribute('data-file');
      showFileDetails(file);
    });
  });
}

/**
 * Show file details when a file is clicked in the explorer
 */
function showFileDetails(file) {
  // Highlight the selected file
  document.querySelectorAll('.file-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-file') === file) {
      item.classList.add('active');
    }
  });
  
  // Get references for this file
  const refs = adrData.references.filter(ref => ref.file === file);
  
  // Sort by line number
  refs.sort((a, b) => a.line - b.line);
  
  // Create a modal to show file details
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'fileDetailsModal';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'fileDetailsModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  
  let html = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="fileDetailsModalLabel">${getFileName(file)}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">${file}</p>
          <h6>ADR References:</h6>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Line</th>
                <th>ADR ID</th>
                <th>Comment Type</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  refs.forEach(ref => {
    html += `
      <tr>
        <td>${ref.line}</td>
        <td>${ref.id}</td>
        <td><code>${formatCommentType(ref.commentType)}</code></td>
      </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  document.body.appendChild(modal);
  
  // Show the modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  
  // Remove the modal from the DOM when it's hidden
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

/**
 * Apply filters to the ADR documents
 */
function applyFilters() {
  renderAdrDocuments();
}

/**
 * Get the current status filter values
 */
function getStatusFilters() {
  const statusFilters = [];
  
  if (document.getElementById('statusAccepted').checked) {
    statusFilters.push('accepted');
  }
  
  if (document.getElementById('statusProposed').checked) {
    statusFilters.push('proposed');
  }
  
  if (document.getElementById('statusRejected').checked) {
    statusFilters.push('rejected');
  }
  
  if (document.getElementById('statusDeprecated').checked) {
    statusFilters.push('deprecated');
  }
  
  // Always include 'unknown' status
  statusFilters.push('unknown');
  
  return statusFilters;
}

/**
 * Check if an ADR document matches the search term
 */
function matchesSearchTerm(doc, term) {
  return (
    doc.id.toLowerCase().includes(term) ||
    doc.title.toLowerCase().includes(term) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(term)))
  );
}

/**
 * Get the status class for a given status
 */
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'status-accepted';
    case 'rejected':
      return 'status-rejected';
    case 'deprecated':
      return 'status-deprecated';
    case 'proposed':
      return 'status-proposed';
    default:
      return 'status-unknown';
  }
}

/**
 * Get the file name from a file path
 */
function getFileName(filePath) {
  return filePath.split('/').pop();
}

/**
 * Format the comment type for display
 */
function formatCommentType(commentType) {
  return commentType
    .replace(/\\/g, '')
    .replace(/\/\//g, '// ')
    .replace(/\/\*/g, '/* ')
    .replace(/\*\//g, ' */')
    .replace(/\*/g, '*');
}

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
